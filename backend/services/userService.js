const db = require('../connectionMySQL');
const bcrypt = require('bcryptjs');

/**
 * Public lookup: Retrieves all users without exposing sensitive data (email, password hash).
 * @returns {Promise<Array<object>>} Resolves with array of public user objects.
 */
function getAllUsers() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, username, display_name AS displayName, role, avatar, xp, created_at AS createdAt
            FROM users 
            ORDER BY xp DESC, created_at ASC
        `;
        db.query(sql, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

/**
 * Public lookup: Retrieves a single user by ID without exposing sensitive data (email, password hash).
 * @param {number|string} id - Target user ID.
 * @returns {Promise<object|null>} Resolves with public user object or null if not found.
 */
function getUserById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, username, display_name AS displayName, role, avatar, xp, created_at AS createdAt
            FROM users 
            WHERE id = ?
        `;
        db.query(sql, [id], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);
            resolve(rows[0]);
        });
    });
}

/**
 * Private profile lookup: Only for the authenticated user viewing their own account.
 * @param {number|string} id - Target user ID.
 * @returns {Promise<object|null>} Resolves with full user profile including email, or null.
 */
function getUserProfileById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT id, username, email, display_name AS displayName, role, avatar, xp, created_at AS createdAt
            FROM users 
            WHERE id = ?
        `;
        db.query(sql, [id], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);
            resolve(rows[0]);
        });
    });
}

/**
 * Internal query: Looks up a user record by username or email (includes password hash for auth).
 * @param {string} identifier - Username or email address to search.
 * @returns {Promise<object|null>} Resolves with user row or null if not found.
 */
function getUserByUsernameOrEmail(identifier) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
        db.query(sql, [identifier, identifier], (err, rows) => {
            if (err) return reject(err);
            if (!rows || rows.length === 0) return resolve(null);
            resolve(rows[0]);
        });
    });
}

/**
 * Registers a new user with bcrypt password hashing after verifying username/email uniqueness.
 * @param {object} params - Registration data.
 * @param {string} params.username - Desired username.
 * @param {string} params.email - User email address.
 * @param {string} params.password - Plaintext password to hash.
 * @param {string} [params.displayName] - Optional display name.
 * @returns {Promise<object>} Resolves with newly created user record.
 */
async function register({ username, email, password, displayName }) {
    const u = username.trim();
    const e = email.trim().toLowerCase();
    const existing = (await getUserByUsernameOrEmail(u)) || (await getUserByUsernameOrEmail(e));
    if (existing) {
        throw new Error('Username or email already in use');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO users (username, email, password_hash, display_name, role)
            VALUES (?, ?, ?, ?, 'user')
        `;
        const params = [username.trim(), email.trim().toLowerCase(), passwordHash, displayName || username];

        db.query(sql, params, (err, result) => {
            if (err) return reject(err);
            resolve({
                id: result.insertId,
                username,
                email,
                displayName: displayName || username,
                role: 'user',
                xp: 0
            });
        });
    });
}

/**
 * Authenticates user credentials with bcrypt comparison and returns profile data.
 * @param {object} params - Login credentials.
 * @param {string} params.username - Username or email address.
 * @param {string} params.password - Plaintext password to verify.
 * @returns {Promise<object>} Resolves with authenticated user profile.
 */
async function login({ username, password }) {
    const user = await getUserByUsernameOrEmail(username);
    if (!user) {
        throw new Error('Invalid username/email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        throw new Error('Invalid username/email or password');
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        avatar: user.avatar,
        xp: user.xp
    };
}

/**
 * Updates an existing user's display name or avatar.
 * @param {number|string} id - Target user ID.
 * @param {object} params - Profile fields to update.
 * @param {string} [params.displayName] - New display name.
 * @param {string} [params.avatar] - New avatar identifier or URL.
 * @returns {Promise<object>} Resolves with database query result.
 */
function updateUser(id, { displayName, avatar }) {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET display_name = COALESCE(?, display_name), avatar = COALESCE(?, avatar) WHERE id = ?';
        db.query(sql, [displayName, avatar, id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

/**
 * Deletes a user account by ID.
 * @param {number|string} id - Target user ID.
 * @returns {Promise<object>} Resolves with database query result.
 */
function deleteUser(id) {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM users WHERE id = ?';
        db.query(sql, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserProfileById,
    getUserByUsernameOrEmail,
    register,
    login,
    updateUser,
    deleteUser
};
