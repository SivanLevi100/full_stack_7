/**
 * Categories Routes
 * 
 * Handles CRUD operations for product categories.
 * Routes:
 * - GET /                     : Get all categories
 * - GET /:id                  : Get a single category by ID (with product count)
 * - POST /                    : Create a new category (admin only)
 * - PUT /:id                  : Update a category (admin only)
 * - DELETE /:id               : Delete a category (admin only)
 * - GET /reports/products-count : Get categories with their products count (admin only)
 */

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

/**
 * GET /
 * Fetch all active categories.
 */
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /:id
 * Fetch a single category by its ID.
 * Adds a `products_count` field to show how many products belong to this category.
 */
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const productsCount = await Category.getProductsCount(req.params.id);
        category.products_count = productsCount;

        res.json(category);
    } catch (err) {
        console.error('Get category error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /
 * Create a new category. Only accessible by admin users.
 * Supports optional image upload.
 */
router.post('/', authenticateToken, authorizeRole(['admin']), upload.single('image'), async (req, res) => {
    try {
        const categoryData = { ...req.body };
        if (req.file) {
            categoryData.image_url = `/uploads/${req.file.filename}`;
        }

        const categoryId = await Category.create(categoryData);
        const category = await Category.findById(categoryId);
        res.status(201).json(category);
    } catch (err) {
        console.error('Create category error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /:id
 * Update an existing category by ID. Only accessible by admin users.
 * Supports optional image upload.
 */
router.put('/:id', authenticateToken, authorizeRole(['admin']), upload.single('image'), async (req, res) => {
    try {
        const categoryData = { ...req.body };
        if (req.file) {
            categoryData.image_url = `/uploads/${req.file.filename}`;
        }

        const success = await Category.update(req.params.id, categoryData);
        if (!success) return res.status(404).json({ message: 'Category not found' });

        const category = await Category.findById(req.params.id);
        res.json(category);
    } catch (err) {
        console.error('Update category error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /:id
 * Delete a category by ID (soft delete: sets is_active = false). Admin only.
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const success = await Category.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /reports/products-count
 * Generate a report of categories with their number of products.
 * Admin only.
 */
router.get('/reports/products-count', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const categoriesReport = await Category.getCategoriesWithProductsCount();
        res.json(categoriesReport);
    } catch (err) {
        console.error('Get categories report error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
