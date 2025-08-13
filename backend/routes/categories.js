// routes/categories.js
const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
// קבלת כל הקטגוריות
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (err) {
        console.error('Get categories error:', err);
        res.status(500).json({ error: err.message });
    }
});

// קבלת קטגוריה לפי ID
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        
        // Add products count
        const productsCount = await Category.getProductsCount(req.params.id);
        category.products_count = productsCount;
        
        res.json(category);
    } catch (err) {
        console.error('Get category error:', err);
        res.status(500).json({ error: err.message });
    }
});

// יצירת קטגוריה חדשה (מנהלים בלבד)
router.post('/', authenticateToken, authorizeRole(['manager']), upload.single('image'), async (req, res) => {
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

// עדכון קטגוריה (מנהלים בלבד)
router.put('/:id', authenticateToken, authorizeRole(['manager']), upload.single('image'), async (req, res) => {
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

// מחיקת קטגוריה (מנהלים בלבד)
router.delete('/:id', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        const success = await Category.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        console.error('Delete category error:', err);
        res.status(500).json({ error: err.message });
    }
});

// קבלת קטגוריות עם מספר המוצרים שלהן (מנהלים בלבד)
router.get('/reports/products-count', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        const categoriesReport = await Category.getCategoriesWithProductsCount();
        res.json(categoriesReport);
    } catch (err) {
        console.error('Get categories report error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
