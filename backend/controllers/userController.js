const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');

/**
 * Handles GET /api/users.
 * Retrieves all registered users (public fields only).
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles GET /api/users/:id.
 * Retrieves public user profile by ID.
 * @param {import('express').Request} req - Express request object with id param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userService.getUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: `User with id ${id} not found`
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles GET /api/users/profile/me.
 * Retrieves full authenticated user profile including email.
 * @param {import('express').Request} req - Express request object with authenticated user session.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getMe = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }
        const user = await userService.getUserProfileById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles POST /api/users/register.
 * Registers a new user account and returns a signed JWT.
 * @param {import('express').Request} req - Express request object with registration credentials.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password, displayName } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required'
            });
        }

        const user = await userService.register({ username, email, password, displayName });
        const token = generateToken({ id: user.id, username: user.username, role: user.role });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles POST /api/users/login.
 * Authenticates user credentials and returns a signed JWT.
 * @param {import('express').Request} req - Express request object with login credentials.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const user = await userService.login({ username, password });
        const token = generateToken({ id: user.id, username: user.username, role: user.role });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles PUT /api/users/:id.
 * Updates user profile details with owner or administrator authorization.
 * @param {import('express').Request} req - Express request object with user id and profile update payload.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Authorization check: only the account owner or an admin can update profile
        if (!req.user || (Number(req.user.id) !== Number(id) && req.user.role !== 'admin')) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: You can only update your own profile'
            });
        }

        const { displayName, avatar } = req.body;
        await userService.updateUser(id, { displayName, avatar });
        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Handles DELETE /api/users/:id.
 * Deletes user account with owner or administrator authorization.
 * @param {import('express').Request} req - Express request object with user id param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Authorization check: only the account owner or an admin can delete
        if (!req.user || (Number(req.user.id) !== Number(id) && req.user.role !== 'admin')) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Insufficient permissions to delete this account'
            });
        }

        await userService.deleteUser(id);
        res.json({
            success: true,
            message: `User ${id} deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
