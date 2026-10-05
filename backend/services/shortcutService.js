const db = require('../connectionMySQL');

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
