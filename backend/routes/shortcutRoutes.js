const express = require('express');
const router = express.Router();
const shortcutController = require('../controllers/shortcutController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/api/shortcuts', shortcutController.getShortcuts);
router.get('/api/shortcuts/:id', shortcutController.getShortcut);
router.post('/api/shortcuts', authenticateToken, requireAdmin, shortcutController.createShortcut);
router.delete('/api/shortcuts/:id', authenticateToken, requireAdmin, shortcutController.deleteShortcut);

module.exports = router;
