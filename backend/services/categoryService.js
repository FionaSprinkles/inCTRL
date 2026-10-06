const db = require('../connectionMySQL');

/**
 * Retrieves all categories ordered by display order and name.
 * @returns {Promise<Array<object>>} Resolves with list of category objects.
 */
function getCategories() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, name, slug, description, icon, display_order AS displayOrder FROM categories ORDER BY display_order ASC, name ASC';
        db.query(sql, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

/**
 * Retrieves a single category by ID.
 * @param {number|string} id - Category ID.
 * @returns {Promise<object|null>} Resolves with category object or null if not found.
 */
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

/**
 * Creates a new shortcut category in the database.
 * @param {object} params - Category parameters.
 * @param {string} params.name - Category display name.
 * @param {string} [params.slug] - URL-friendly slug.
 * @param {string} [params.description=''] - Optional category description.
 * @param {string} [params.icon='keyboard'] - Category icon identifier.
 * @returns {Promise<object>} Resolves with created category record.
 */
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
