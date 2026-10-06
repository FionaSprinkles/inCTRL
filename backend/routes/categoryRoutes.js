const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/api/categories', categoryController.getCategories);
router.get('/api/categories/:id', categoryController.getCategory);
router.post('/api/categories', authenticateToken, requireAdmin, categoryController.createCategory);

module.exports = router;