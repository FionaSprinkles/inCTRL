const categoryService = require('../services/categoryService');

exports.getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        res.json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryService.getCategoryById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: `Category with id ${id} not found`
            });
        }
        res.json({
            success: true,
            category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, slug, description, icon } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Category name is required'
            });
        }

        const category = await categoryService.createCategory({ name, slug, description, icon });
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};