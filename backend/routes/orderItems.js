// routes/orderItems.js
const express = require('express');
const router = express.Router();
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// קבלת כל פריטי ההזמנה (מנהלים בלבד)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const filters = {
            order_id: req.query.order_id,
            product_id: req.query.product_id
        };
        const items = await OrderItem.findAll(filters);
        res.json(items);
    } catch (err) {
        console.error('Get order items error:', err);
        res.status(500).json({ error: err.message });
    }
});

// קבלת פריט הזמנה לפי ID (מנהלים בלבד)
router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const item = await OrderItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Order item not found' });
        res.json(item);
    } catch (err) {
        console.error('Get order item error:', err);
        res.status(500).json({ error: err.message });
    }
});

// הוספה או עדכון פריט להזמנה (מנהלים בלבד)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { order_id, product_id, quantity, unit_price } = req.body;
        if (!order_id || !product_id || !quantity || !unit_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // בדיקה אם הפריט כבר קיים
        const existingItems = await OrderItem.findAll({ order_id, product_id });

        if (existingItems.length > 0) {
            // עדכון פריט קיים
            const existingItem = existingItems[0];
            const newQuantity = existingItem.quantity + quantity;

            await OrderItem.update(existingItem.id, { quantity: newQuantity, unit_price });

            // עדכון מלאי המוצר (מינוס הכמות שהוספה)
            const product = await Product.findById(product_id);
            const newStock = product.stock_quantity - quantity;
            await Product.updateStock(product_id, newStock);

            const updatedItem = await OrderItem.findById(existingItem.id);
            return res.status(200).json(updatedItem);
        }

        // יצירת פריט חדש
        const id = await OrderItem.create({ order_id, product_id, quantity, unit_price });

        // עדכון מלאי המוצר
        const product = await Product.findById(product_id);
        const newStock = product.stock_quantity - quantity;
        await Product.updateStock(product_id, newStock);

        const newItem = await OrderItem.findById(id);
        res.status(201).json(newItem);

    } catch (err) {
        console.error('Create order item error:', err);
        res.status(500).json({ error: err.message });
    }
});



// עדכון פריט הזמנה (מנהלים בלבד)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { quantity, unit_price } = req.body;

        // שליפת הפריט הקיים
        const existingItem = await OrderItem.findById(req.params.id);
        if (!existingItem) return res.status(404).json({ message: 'Order item not found' });

        // עדכון פריט ההזמנה
        const updated = await OrderItem.update(req.params.id, { quantity, unit_price });
        if (!updated) return res.status(400).json({ message: 'No changes made' });

        // עדכון מלאי המוצר בהתאם לשינוי בכמות
        const quantityDifference = quantity - existingItem.quantity; // חיובי = נצרך יותר, שלילי = החזר מלאי
        const product = await Product.findById(existingItem.product_id);
        const newStock = product.stock_quantity - quantityDifference;
        await Product.updateStock(existingItem.product_id, newStock);

        const updatedItem = await OrderItem.findById(req.params.id);
        res.json(updatedItem);

    } catch (err) {
        console.error('Update order item error:', err);
        res.status(500).json({ error: err.message });
    }
});


// מחיקת פריט הזמנה (מנהלים בלבד)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const deleted = await OrderItem.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Order item not found' });

        res.json({ message: 'Order item deleted successfully' });
    } catch (err) {
        console.error('Delete order item error:', err);
        res.status(500).json({ error: err.message });
    }
});

// קבלת כל הפריטים של הזמנה מסוימת (מנהל או המשתמש שהזמין)
router.get('/order/:orderId', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // מנהל יכול לראות הכול, משתמש רגיל רק אם זה שלו
        if (req.user.role !== 'admin') {
            const [orderCheck] = await pool.execute('SELECT user_id FROM orders WHERE id = ?', [orderId]);
            if (!orderCheck.length || orderCheck[0].user_id !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const items = await OrderItem.findByOrderId(orderId);
        res.json(items);
    } catch (err) {
        console.error('Get order items by order error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
