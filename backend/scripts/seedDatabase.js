require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const db = require('../connectionMySQL');
const categories = require('../data/categoriesSeed.json');
const shortcuts = require('../data/windowsShortcutsSeed.json');

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
 * Seeds or updates the database with categories and Windows shortcuts.
 * Queries are executed sequentially to avoid dangling operations if an error occurs.
 */
async function seedDatabase(categoriesToSeed = categories, shortcutsToSeed = shortcuts) {
    console.log('🌱 Starting database seed process...');

    const cats = categoriesToSeed || [];
    const scs = shortcutsToSeed || [];

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

module.exports = { seedDatabase };
