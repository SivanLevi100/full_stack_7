/**
 * Products Routes
 * 
 * Routes:
 * - GET /                 : Get all products with optional filters
 * - GET /:id              : Get a single product by ID
 * - POST /                : Create a new product (admin only)
 * - PUT /:id              : Update a product (admin only)
 * - DELETE /:id           : Delete/deactivate a product (admin only)
 * - PUT /:id/stock        : Update product stock (admin only)
 * - GET /reports/low-stock: Get products with low stock (admin only)
 */

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

/**
 * GET /
 * Get all products with optional filters:
 * category, search, min_price, max_price, sort_by, sort_order, limit
 */
router.get('/', async (req, res) => {
    try {
        const filters = {
            category_id: req.query.category,
            search: req.query.search,
            min_price: req.query.min_price,
            max_price: req.query.max_price,
            sort_by: req.query.sort_by,
            sort_order: req.query.sort_order,
            limit: req.query.limit
        };

        const products = await Product.findAll(filters);
        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /:id
 * Get a single product by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /
 * Create a new product (admin only)
 * Handles optional image upload
 */
router.post('/', authenticateToken, authorizeRole(['admin']), upload.single('image'), async (req, res) => {
    try {
        const productData = { ...req.body };
        if (req.file) productData.image_url = `/uploads/${req.file.filename}`;

        const productId = await Product.create(productData);
        const product = await Product.findById(productId);
        res.status(201).json(product);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /:id
 * Update a product (admin only)
 * Handles optional image upload
 */
router.put('/:id', authenticateToken, authorizeRole(['admin']), upload.single('image'), async (req, res) => {
    try {
        const productData = { ...req.body };
        if (req.file) productData.image_url = `/uploads/${req.file.filename}`;

        const success = await Product.update(req.params.id, productData);
        if (!success) return res.status(404).json({ message: 'Product not found' });

        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /:id
 * Delete or deactivate a product (admin only)
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const success = await Product.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product deactivated successfully' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /:id/stock
 * Update product stock quantity (admin only)
 */
router.put('/:id/stock', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { quantity } = req.body;
        const success = await Product.updateStock(req.params.id, quantity);
        if (!success) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Stock updated successfully' });
    } catch (err) {
        console.error('Update stock error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /reports/low-stock
 * Get products with low stock (admin only)
 */
router.get('/reports/low-stock', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const products = await Product.getLowStockProducts();
        res.json(products);
    } catch (err) {
        console.error('Get low stock products error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
