const userService = require('../services/userService');

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
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
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
        res.json({
            success: true,
            message: 'Login successful',
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
