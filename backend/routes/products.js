const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
// קבלת כל המוצרים (עם פילטרים)
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

// קבלת מוצר לפי ID
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

// יצירת מוצר חדש (מנהלים בלבד)
router.post('/', authenticateToken, authorizeRole(['admin']), upload.single('image'), async (req, res) => {
    try {
        const productData = { ...req.body };
        if (req.file) {
            productData.image_url = `/uploads/${req.file.filename}`;
        }

        const productId = await Product.create(productData);
        const product = await Product.findById(productId);
        res.status(201).json(product);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: err.message });
    }
});

// עדכון מוצר (מנהלים בלבד)
router.put('/:id', authenticateToken, authorizeRole(['admin']), upload.single('image'), async (req, res) => {
    try {
        const productData = { ...req.body };
        if (req.file) {
            productData.image_url = `/uploads/${req.file.filename}`;
        }

        const success = await Product.update(req.params.id, productData);
        if (!success) return res.status(404).json({ message: 'Product not found' });
        
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: err.message });
    }
});

// מחיקת מוצר (מנהלים בלבד)
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

// עדכון מלאי (מנהלים בלבד)
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

// קבלת מוצרים עם מלאי נמוך (מנהלים בלבד)
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
