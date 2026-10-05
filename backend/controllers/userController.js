const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');

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
