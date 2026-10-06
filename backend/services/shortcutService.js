const db = require('../connectionMySQL');

/**
 * Retrieves all Windows shortcuts matching optional filter criteria (search query, category, difficulty).
 * @param {object} [filters={}] - Query filters object.
 * @param {string} [filters.q] - Search keyword matching title, combo, or description.
 * @param {number|string} [filters.categoryId] - Unique category ID filter.
 * @param {string} [filters.difficulty] - Difficulty level filter.
 * @returns {Promise<Array<object>>} Resolves with list of shortcut records.
 */
function getAllShortcuts(filters = {}) {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT 
                s.id, 
                s.title, 
                s.key_combo AS keyCombo, 
                s.description, 
                s.category_id AS categoryId, 
                c.name AS categoryName,
                s.difficulty, 
                s.created_at AS createdAt
            FROM windows_shortcuts s
            LEFT JOIN categories c ON s.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.q) {
            sql += ' AND (s.title LIKE ? OR s.key_combo LIKE ? OR s.description LIKE ?)';
            const term = `%${filters.q}%`;
            params.push(term, term, term);
        }

        if (filters.categoryId) {
            sql += ' AND s.category_id = ?';
            params.push(filters.categoryId);
        }

        if (filters.difficulty) {
            sql += ' AND s.difficulty = ?';
            params.push(filters.difficulty);
        }

        sql += ' ORDER BY s.id ASC';

        db.query(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

/**
 * Retrieves a single Windows shortcut by ID.
 * @param {number|string} id - Shortcut ID.
 * @returns {Promise<object|null>} Resolves with shortcut record or null if not found.
 */
function getShortcutById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                s.id, 
                s.title, 
                s.key_combo AS keyCombo, 
                s.description, 
                s.category_id AS categoryId, 
                c.name AS categoryName,
                s.difficulty, 
                s.created_at AS createdAt
            FROM windows_shortcuts s
            LEFT JOIN categories c ON s.category_id = c.id
            WHERE s.id = ?
        `;
        db.query(sql, [id], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);
            resolve(rows[0]);
        });
    });
}

/**
 * Inserts a new Windows shortcut into the database.
 * @param {object} params - Shortcut parameters.
 * @param {string} params.title - Shortcut name/title.
 * @param {string} params.keyCombo - Key combination string (e.g. "Ctrl + C").
 * @param {string} params.description - Explanation of what the shortcut does.
 * @param {number|string} [params.categoryId] - Optional associated category ID.
 * @param {string} [params.difficulty='Beginner'] - Difficulty rating.
 * @returns {Promise<object>} Resolves with created shortcut object.
 */
function createShortcut({ title, keyCombo, description, categoryId, difficulty = 'Beginner' }) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO windows_shortcuts (title, key_combo, description, category_id, difficulty)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [title, keyCombo, description, categoryId || null, difficulty];

        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve({
                id: result.insertId,
                title,
                keyCombo,
                description,
                categoryId,
                difficulty
            });
        });
    });
}

/**
 * Deletes a Windows shortcut by ID.
 * @param {number|string} id - Target shortcut ID.
 * @returns {Promise<object>} Resolves with database query result.
 */
function deleteShortcut(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM windows_shortcuts WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

module.exports = {
    getAllShortcuts,
    getShortcutById,
    createShortcut,
    deleteShortcut
};
