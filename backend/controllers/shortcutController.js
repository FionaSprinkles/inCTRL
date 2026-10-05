const shortcutService = require('../services/shortcutService');

exports.getShortcuts = async (req, res) => {
    try {
        const { q, categoryId, difficulty } = req.query;
        const shortcuts = await shortcutService.getAllShortcuts({ q, categoryId, difficulty });
        res.json({
            success: true,
            count: shortcuts.length,
            shortcuts
        });
    } catch (error) {
        console.error('Error fetching shortcuts:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getShortcut = async (req, res) => {
    try {
        const { id } = req.params;
        const shortcut = await shortcutService.getShortcutById(id);
        if (!shortcut) {
            return res.status(404).json({
                success: false,
                error: `Shortcut with id ${id} not found`
            });
        }
        res.json({
            success: true,
            shortcut
        });
    } catch (error) {
        console.error('Error fetching shortcut:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.createShortcut = async (req, res) => {
    try {
        const { title, keyCombo, description, categoryId, difficulty } = req.body;
        if (!title || !keyCombo || !description) {
            return res.status(400).json({
                success: false,
                error: 'title, keyCombo, and description are required'
            });
        }

        const shortcut = await shortcutService.createShortcut({ title, keyCombo, description, categoryId, difficulty });
        res.status(201).json({
            success: true,
            message: 'Shortcut created successfully',
            shortcut
        });
    } catch (error) {
        console.error('Error creating shortcut:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteShortcut = async (req, res) => {
    try {
        const { id } = req.params;
        await shortcutService.deleteShortcut(id);
        res.json({
            success: true,
            message: `Shortcut ${id} deleted successfully`
        });
    } catch (error) {
        console.error('Error deleting shortcut:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
