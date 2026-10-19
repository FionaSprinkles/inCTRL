const categoryService = require('../services/categoryService');

/**
 * Handles GET /api/categories.
 * Retrieves all shortcut and quiz categories.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
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

/**
 * Handles GET /api/categories/:identifier.
 * Retrieves category details by ID or slug. 
 * 
 * The slug is only allowed letters (a-z) and hyphen (-).
 * 
 * @param {import('express').Request} req - Express request object with id param.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.getCategory = async (req, res) => {
    try {

        const {identifier} = req.params;
        
        const category = /^\d+$/.test(identifier) // This is a test to see if the string contains only numbers or letters. Will return true if string is numbers.
        ? await categoryService.getCategoryById(identifier) //If ?true return id
        : await categoryService.getCategoryBySlug(identifier);// else :false retturn slug

        if (!category) {
            return res.status(404).json({
                success: false,
                error: `Category with ${identifier} not found`
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

/**
 * Handles POST /api/categories.
 * Creates a new shortcut category (admin only).
 * 
 * slugRegex rule: 
 * "[a-z]+" there must be a letter between a-z.
 * "(?:-[a-z]+)*" allows more groups of words with hyphen (-) inbetween.
 * 
 * @param {import('express').Request} req - Express request object with category payload.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
exports.createCategory = async (req, res) => {
    
    try {
        const { name, slug, description, icon } = req.body;

        const slugRegex = /^[a-z]+(?:-[a-z]+)*$/;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Category name is required'
            });
        }

        if (!slugRegex.test(slug)) {
        return res.status(400).json({
            success: false,
            error: 'Slug must contain only lowercase letters (a-z) and single hyphens (-) between words'
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