const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/api/categories', categoryController.getCategories);
router.get('/api/categories/:id', categoryController.getCategory);
router.post('/api/categories', categoryController.createCategory);

module.exports = router;