const db = require('../connectionMySQL');

/**
 * Normalizes a database row into the format expected by frontend quiz components.
 */
function formatQuestionRow(row) {
    let payload = {};
    if (row.payload_json) {
        try {
            payload = typeof row.payload_json === 'string' 
                ? JSON.parse(row.payload_json) 
                : row.payload_json;
        } catch (e) {
            console.error(`Error parsing payload_json for question ${row.id}:`, e);
        }
    }

    return {
        id: row.id,
        type: row.type,
        category: row.category_name,
        categoryId: row.category_id,
        difficulty: row.difficulty,
        prompt: row.prompt,
        hint: row.hint,
        explanation: row.explanation,
        ...payload
    };
}

function getQuestions(filters = {}) {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT * FROM quiz_questions WHERE 1=1';
        const params = [];

        if (filters.type && filters.type !== 'all') {
            sql += ' AND type = ?';
            params.push(filters.type);
        }

        if (filters.difficulty) {
            sql += ' AND difficulty = ?';
            params.push(filters.difficulty);
        }

        if (filters.categoryId) {
            sql += ' AND category_id = ?';
            params.push(filters.categoryId);
        }

        sql += ' ORDER BY created_at ASC';

        db.query(sql, params, (err, rows) => {
            if (err) return reject(err);
            const formatted = rows.map(formatQuestionRow);
            resolve(formatted);
        });
    });
}

function getQuestionById(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM quiz_questions WHERE id = ?';
        db.query(sql, [id], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);
            resolve(formatQuestionRow(rows[0]));
        });
    });
}

function createQuestion(data) {
    return new Promise((resolve, reject) => {
        const {
            id,
            type,
            categoryId,
            categoryName,
            difficulty = 'Beginner',
            prompt,
            hint = null,
            explanation = null,
            ...restPayload
        } = data;

        const payloadJson = JSON.stringify(restPayload.payload || restPayload);

        const sql = `
            INSERT INTO quiz_questions 
            (id, type, category_id, category_name, difficulty, prompt, hint, explanation, payload_json) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [id, type, categoryId || null, categoryName || 'General', difficulty, prompt, hint, explanation, payloadJson];

        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve({ id, ...data });
        });
    });
}

function updateQuestion(id, data) {
    return new Promise((resolve, reject) => {
        const {
            type,
            categoryId,
            categoryName,
            difficulty,
            prompt,
            hint,
            explanation,
            ...restPayload
        } = data;

        const payloadJson = JSON.stringify(restPayload.payload || restPayload);

        const sql = `
            UPDATE quiz_questions 
            SET type = ?, category_id = ?, category_name = ?, difficulty = ?, prompt = ?, hint = ?, explanation = ?, payload_json = ?
            WHERE id = ?
        `;
        const params = [type, categoryId || null, categoryName, difficulty, prompt, hint, explanation, payloadJson, id];

        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function deleteQuestion(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM quiz_questions WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

function saveAttempt({ userId = null, guestName = null, formatFilter = 'all', score, maxScore, totalAnswered, timeSpentSeconds = 0 }) {
    return new Promise((resolve, reject) => {
        // Defense-in-depth: validate integer types and bounds
        if (!Number.isInteger(score) || !Number.isInteger(maxScore) || maxScore < 0 || score < 0 || score > maxScore) {
            return reject(new Error('Invalid score bounds: score and maxScore must be integers with 0 <= score <= maxScore'));
        }

        const sql = `
            INSERT INTO quiz_attempts 
            (user_id, guest_name, format_filter, score, max_score, total_answered, time_spent_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [userId || null, guestName || null, formatFilter, score, maxScore, totalAnswered, timeSpentSeconds];

        db.query(sql, params, (err, result) => {
            if (err) return reject(err);

            // Award XP to registered user (e.g. 10 XP per point scored)
            if (userId && score > 0) {
                const xpGain = score * 10;
                db.query('UPDATE users SET xp = xp + ? WHERE id = ?', [xpGain, userId], (xpErr) => {
                    if (xpErr) console.error('Error updating user XP:', xpErr);
                });
            }

            resolve({ id: result.insertId, score, maxScore, totalAnswered });
        });
    });
}

function getLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                a.id, 
                a.score, 
                a.max_score AS maxScore, 
                a.total_answered AS totalAnswered, 
                a.time_spent_seconds AS timeSpentSeconds, 
                a.completed_at AS completedAt,
                COALESCE(u.username, a.guest_name, 'Guest') AS username,
                u.display_name AS displayName,
                u.avatar,
                u.xp
            FROM quiz_attempts a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.score DESC, a.time_spent_seconds ASC
            LIMIT ?
        `;
        db.query(sql, [Number(limit)], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getUserAttempts(userId) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, format_filter AS formatFilter, score, max_score AS maxScore, total_answered AS totalAnswered, time_spent_seconds AS timeSpentSeconds, completed_at AS completedAt
            FROM quiz_attempts 
            WHERE user_id = ?
            ORDER BY completed_at DESC
        `;
        db.query(sql, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    saveAttempt,
    getLeaderboard,
    getUserAttempts
};
