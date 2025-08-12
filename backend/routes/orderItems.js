// routes/orderItems.js
const express = require('express');
const router = express.Router();
const OrderItem = require('../models/OrderItem');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// קבלת כל פריטי ההזמנה (מנהלים בלבד)
router.get('/', authenticateToken, authorizeRole(['manager']), async (req, res) => {
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
router.get('/:id', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        const item = await OrderItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Order item not found' });
        res.json(item);
    } catch (err) {
        console.error('Get order item error:', err);
        res.status(500).json({ error: err.message });
    }
});

// הוספת פריט להזמנה (מנהלים בלבד)
router.post('/', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        const { order_id, product_id, quantity, unit_price } = req.body;
        if (!order_id || !product_id || !quantity || !unit_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const id = await OrderItem.create({ order_id, product_id, quantity, unit_price });
        const newItem = await OrderItem.findById(id);
        res.status(201).json(newItem);
    } catch (err) {
        console.error('Create order item error:', err);
        res.status(500).json({ error: err.message });
    }
});

// עדכון פריט הזמנה (מנהלים בלבד)
router.put('/:id', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        const updated = await OrderItem.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Order item not found or no changes made' });

        const updatedItem = await OrderItem.findById(req.params.id);
        res.json(updatedItem);
    } catch (err) {
        console.error('Update order item error:', err);
        res.status(500).json({ error: err.message });
    }
});

// מחיקת פריט הזמנה (מנהלים בלבד)
router.delete('/:id', authenticateToken, authorizeRole(['manager']), async (req, res) => {
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
        if (req.user.role !== 'manager') {
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
