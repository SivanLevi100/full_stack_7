/**
 * Orders Routes
 * 
 * Handles CRUD operations for orders.
 * Routes:
 * - GET /                   : Get all orders (admin only, with optional filters)
 * - GET /:id                 : Get a single order by ID (admin or owner)
 * - POST /                   : Create a new order (authenticated user)
 * - PUT /:id/status          : Update order status (admin only)
 * - PUT /:id/payment-status  : Update payment status (admin only)
 * - PUT /:id/total           : Update total amount (admin only)
 * - DELETE /:id              : Delete an order (admin only)
 * - GET /my/orders           : Get all orders of the current user
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * GET /
 * Get all orders with optional filters: user_id, status, date_from, date_to.
 * Admin only.
 */
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
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

/**
 * GET /:id
 * Get a single order by ID.
 * Admin can access all; users can access only their own orders.
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const items = await Order.getOrderItems(req.params.id);
        res.json({ ...order, items });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /
 * Create a new order.
 * Authenticated users only.
 * Updates product stock for each item.
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const orderData = {
            user_id: req.user.id,
            order_number: `ORD-${Date.now()}`,
            total_amount: req.body.total_amount,
            status: 'pending',
            order_date: new Date().toISOString()
        };

        const { orderId, orderNumber } = await Order.create(orderData);

        // Add order items and update product stock
        if (Array.isArray(req.body.items)) {
            for (const item of req.body.items) {
                await Order.addOrderItem({
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price
                });

                const product = await Product.findById(item.product_id);
                const newStock = product.stock_quantity - item.quantity;
                await Product.updateStock(item.product_id, newStock);
            }
        }

        const order = await Order.findById(orderId);
        const items = await Order.getOrderItems(orderId);
        res.status(201).json({ ...order, items, orderNumber });

    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /:id/status
 * Update the status of an order.
 * Admin only.
 */
router.put('/:id/status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
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

/**
 * PUT /:id/payment-status
 * Update payment status of an order.
 * Admin only.
 */
router.put('/:id/payment-status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
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

/**
 * PUT /:id/total
 * Update total amount of an order.
 * Admin only.
 */
router.put('/:id/total', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { total_amount } = req.body;
        if (!total_amount && total_amount !== 0) {
            return res.status(400).json({ error: 'Total amount is required' });
        }

        const success = await Order.updateTotal(req.params.id, total_amount);
        if (!success) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order total updated successfully', total_amount });
    } catch (err) {
        console.error('Update order total error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /:id
 * Delete an order.
 * Admin only.
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const success = await Order.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /my/orders
 * Get all orders for the authenticated user.
 */
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
