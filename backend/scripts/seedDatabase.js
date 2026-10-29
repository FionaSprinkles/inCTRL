require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../connectionMySQL');
const fs = require('fs');
const path = require('path');
const categories = require('../data/categoriesSeed.json');
const shortcuts = require('../data/windowsShortcutsSeed.json');
const quizzes = require('../data/quizzesSeed.json');

/**
 * Loads all questions from modular JSON files inside backend/data/quizQuestions.
 * Throws an error if any file cannot be read, contains malformed JSON, or is not an array.
 */
function loadAllQuizQuestions() {
    const questionsDir = path.resolve(__dirname, '../data/quizQuestions');
    if (!fs.existsSync(questionsDir)) return [];
    const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json')).sort();
    let all = [];
    for (const f of files) {
        try {
            const raw = fs.readFileSync(path.join(questionsDir, f), 'utf-8');
            const content = JSON.parse(raw);
            if (!Array.isArray(content)) {
                throw new Error(`File content must be a JSON array, got ${typeof content}`);
            }
            all = all.concat(content);
        } catch (e) {
            throw new Error(`Failed to load quiz question file "${f}": ${e.message}`);
        }
    }
    return all;
}

/**
 * Helper to run a SQL query as a Promise against the callback-based db pool.
 */
function executeQuery(sql, params) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

/**
 * Seeds or updates the database with categories, shortcuts, quizzes, and quiz questions.
 * Queries are executed sequentially to avoid dangling operations if an error occurs.
 */
async function seedDatabase(
    categoriesToSeed,
    shortcutsToSeed,
    quizzesToSeed,
    questionsToSeed
) {
    console.log('🌱 Starting database seed process...');

    const isDefaultRun = arguments.length === 0;
    const cats = isDefaultRun ? categories : (categoriesToSeed || []);
    const scs = isDefaultRun ? shortcuts : (shortcutsToSeed || []);
    const qzs = isDefaultRun ? quizzes : (quizzesToSeed || []);
    const qqs = isDefaultRun ? loadAllQuizQuestions() : (questionsToSeed || []);

    // 1. Seed categories
    console.log(`📦 Seeding ${cats.length} categories...`);
    for (const cat of cats) {
        const sqlCat = `
            INSERT INTO categories (id, name, slug, description, icon, display_order)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                slug = VALUES(slug),
                description = VALUES(description),
                icon = VALUES(icon),
                display_order = VALUES(display_order)
        `;
        try {
            await executeQuery(sqlCat, [cat.id, cat.name, cat.slug, cat.description, cat.icon, cat.display_order]);
        } catch (err) {
            console.error(`❌ Failed to seed category ${cat.name}:`, err.message);
            throw err;
        }
    }
    console.log('✅ Categories successfully seeded/updated.');

    // 2. Seed shortcuts
    console.log(`📦 Seeding ${scs.length} shortcuts...`);
    for (const s of scs) {
        const sqlShortcut = `
            INSERT INTO windows_shortcuts (id, title, key_combo, description, category_id, difficulty)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                key_combo = VALUES(key_combo),
                description = VALUES(description),
                category_id = VALUES(category_id),
                difficulty = VALUES(difficulty)
        `;
        try {
            await executeQuery(sqlShortcut, [s.id, s.title, s.key_combo, s.description, s.category_id, s.difficulty]);
        } catch (err) {
            console.error(`❌ Failed to seed shortcut ${s.title}:`, err.message);
            throw err;
        }
    }
    console.log('✅ All Windows shortcuts successfully seeded/updated.');

    // 3. Seed quizzes
    console.log(`📦 Seeding ${qzs.length} quizzes...`);
    for (const q of qzs) {
        const sqlQuiz = `
            INSERT INTO quizzes (id, title, description, category_id, difficulty)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                description = VALUES(description),
                category_id = VALUES(category_id),
                difficulty = VALUES(difficulty)
        `;
        try {
            await executeQuery(sqlQuiz, [
                q.id,
                q.title,
                q.description || null,
                q.category_id !== undefined ? q.category_id : null,
                q.difficulty || 'Beginner'
            ]);
        } catch (err) {
            console.error(`❌ Failed to seed quiz ${q.title}:`, err.message);
            throw err;
        }
    }
    console.log('✅ All quizzes successfully seeded/updated.');

    // 4. Seed quiz questions (if provided)
    if (qqs.length > 0) {
        console.log(`📦 Seeding ${qqs.length} quiz questions...`);
        for (const qq of qqs) {
            const sqlQuestion = `
                INSERT INTO quiz_questions (id, quiz_id, type, category_id, category_name, difficulty, prompt, key_combination, hint, explanation, payload_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    quiz_id = VALUES(quiz_id),
                    type = VALUES(type),
                    category_id = VALUES(category_id),
                    category_name = VALUES(category_name),
                    difficulty = VALUES(difficulty),
                    prompt = VALUES(prompt),
                    key_combination = VALUES(key_combination),
                    hint = VALUES(hint),
                    explanation = VALUES(explanation),
                    payload_json = VALUES(payload_json)
            `;
            const payloadJson = typeof qq.payload_json === 'string'
                ? qq.payload_json
                : JSON.stringify(qq.payload || qq.payload_json || {});
            try {
                await executeQuery(sqlQuestion, [
                    qq.id,
                    qq.quiz_id !== undefined ? qq.quiz_id : null,
                    qq.type,
                    qq.category_id !== undefined ? qq.category_id : null,
                    qq.category_name,
                    qq.difficulty || 'Beginner',
                    qq.prompt,
                    qq.key_combination || null,
                    qq.hint || null,
                    qq.explanation || null,
                    payloadJson
                ]);
            } catch (err) {
                console.error(`❌ Failed to seed quiz question ${qq.id}:`, err.message);
                throw err;
            }
        }
        console.log('✅ All quiz questions successfully seeded/updated.');
        if (isDefaultRun) {
            await executeQuery('UPDATE result_questions rq JOIN quiz_attempts qa ON rq.result_id = qa.id SET rq.score = rq.score * 100 WHERE qa.max_score > 0 AND (qa.max_score = qa.total_answered OR qa.max_score < 100)', []);
            await executeQuery('UPDATE quiz_attempts SET score = score * 100, max_score = max_score * 100 WHERE max_score > 0 AND (max_score = total_answered OR max_score < 100)', []);

        }
    }
}

if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('🎉 Database seeding complete!');
            process.exit(0);
        })
        .catch(err => {
            console.error('💥 Database seeding failed:', err);
            process.exit(1);
        });
}

module.exports = { seedDatabase, loadAllQuizQuestions };
