const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// קבלת כל ההזמנות (מנהלים בלבד) עם פילטרים
router.get('/', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        const filters = {
            user_id: req.query.user_id,
            status: req.query.status,
            date_from: req.query.date_from,
            date_to: req.query.date_to,
        };
        const orders = await Order.findAll(filters);
        res.json(orders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: err.message });
    }
});

// קבלת הזמנה לפי ID - מנהל או המשתמש שהזמין
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role !== 'manager' && order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // ניתן להוסיף גם פריטי הזמנה
        const items = await Order.getOrderItems(req.params.id);
        res.json({ ...order, items });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: err.message });
    }
});

// יצירת הזמנה חדשה (רק למשתמש עצמו)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const orderData = {
            user_id: req.user.id,
            total_amount: req.body.total_amount,
            discount_amount: req.body.discount_amount || 0,
            tax_amount: req.body.tax_amount || 0,
            delivery_fee: req.body.delivery_fee || 0,
            delivery_address: req.body.delivery_address,
            delivery_phone: req.body.delivery_phone,
            notes: req.body.notes,
            payment_method: req.body.payment_method,
        };

        const orderId = await Order.create(orderData);

        // הוספת פריטי הזמנה אם יש
        if (Array.isArray(req.body.items)) {
            for (const item of req.body.items) {
                await Order.addOrderItem({
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                });
            }
        }

        const order = await Order.findById(orderId);
        const items = await Order.getOrderItems(orderId);
        res.status(201).json({ ...order, items });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: err.message });
    }
});

// עדכון סטטוס הזמנה (מנהלים בלבד)
router.put('/:id/status', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ error: 'Status is required' });

        const success = await Order.updateStatus(req.params.id, status);
        if (!success) return res.status(404).json({ message: 'Order not found' });

        const order = await Order.findById(req.params.id);
        res.json(order);
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: err.message });
    }
});

// עדכון סטטוס תשלום הזמנה (מנהלים בלבד)
router.put('/:id/payment-status', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        const { payment_status } = req.body;
        if (!payment_status) return res.status(400).json({ error: 'Payment status is required' });

        const success = await Order.updatePaymentStatus(req.params.id, payment_status);
        if (!success) return res.status(404).json({ message: 'Order not found' });

        const order = await Order.findById(req.params.id);
        res.json(order);
    } catch (err) {
        console.error('Update payment status error:', err);
        res.status(500).json({ error: err.message });
    }
});

// מחיקת הזמנה (מנהלים בלבד)
router.delete('/:id', authenticateToken, authorizeRole(['manager']), async (req, res) => {
    try {
        // למודל שלך אין פונקציית מחיקה, אפשר להוסיף או לשנות סטטוס למחוק (soft delete)
        // כאן נניח שתוסיף פונקציה delete או update סטטוס ל"deleted"
        const success = await Order.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ error: err.message });
    }
});

// קבלת ההזמנות של המשתמש הנוכחי
router.get('/my/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.findAll({ user_id: req.user.id });
        res.json(orders);
    } catch (err) {
        console.error('Get user orders error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
