const express = require('express');
const router = express.Router();
const shortcutController = require('../controllers/shortcutController');

router.get('/api/shortcuts', shortcutController.getShortcuts);
router.get('/api/shortcuts/:id', shortcutController.getShortcut);
router.post('/api/shortcuts', shortcutController.createShortcut);
router.delete('/api/shortcuts/:id', shortcutController.deleteShortcut);

module.exports = router;
