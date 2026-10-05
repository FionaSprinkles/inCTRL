const db = require('../connectionMySQL');

function getCategories() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, name, slug, description, icon, display_order AS displayOrder FROM categories ORDER BY display_order ASC, name ASC';
        db.query(sql, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

function getCategoryById(id) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, name, slug, description, icon, display_order AS displayOrder FROM categories WHERE id = ?';
        db.query(sql, [id], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);
            resolve(rows[0]);
        });
    });
}

function createCategory({ name, slug, description = '', icon = 'keyboard' }) {
    return new Promise((resolve, reject) => {
        const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const sql = 'INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)';
        db.query(sql, [name, generatedSlug, description, icon], (err, result) => {
            if (err) return reject(err);
            resolve({
                id: result.insertId,
                name,
                slug: generatedSlug,
                description,
                icon
            });
        });
    });
}

module.exports = {
    getCategories,
    getCategoryById,
    createCategory
};
