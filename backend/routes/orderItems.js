/**
 * Order Items Routes
 * 
 * Handles CRUD operations for order items and stock management.
 * Routes:
 * - GET /                        : Get all order items (admin only, with optional filters)
 * - GET /:id                     : Get a single order item by ID (admin only)
 * - POST /                       : Add or update an order item (admin only)
 * - PUT /:id                      : Update an order item (admin only)
 * - DELETE /:id                   : Delete an order item (admin only)
 * - GET /order/:orderId           : Get all items of a specific order (admin or owner)
 */

const express = require('express');
const router = express.Router();
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const { pool } = require('../config/database');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * GET /
 * Fetch all order items with optional filters: order_id, product_id.
 * Admin only.
 */
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

/**
 * GET /:id
 * Fetch a single order item by its ID.
 * Admin only.
 */
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

/**
 * POST /
 * Add a new order item or update quantity if it already exists.
 * Updates product stock accordingly.
 * Admin only.
 */
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { order_id, product_id, quantity, unit_price } = req.body;
        if (!order_id || !product_id || !quantity || !unit_price) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if the item already exists in the order
        const existingItems = await OrderItem.findAll({ order_id, product_id });

        if (existingItems.length > 0) {
            // Update existing item quantity
            const existingItem = existingItems[0];
            const newQuantity = existingItem.quantity + quantity;

            await OrderItem.update(existingItem.id, { quantity: newQuantity, unit_price });

            // Update product stock
            const product = await Product.findById(product_id);
            await Product.updateStock(product_id, product.stock_quantity - quantity);

            const updatedItem = await OrderItem.findById(existingItem.id);
            return res.status(200).json(updatedItem);
        }

        // Create a new order item
        const id = await OrderItem.create({ order_id, product_id, quantity, unit_price });

        // Update product stock
        const product = await Product.findById(product_id);
        await Product.updateStock(product_id, product.stock_quantity - quantity);

        const newItem = await OrderItem.findById(id);
        res.status(201).json(newItem);

    } catch (err) {
        console.error('Create order item error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /:id
 * Update an existing order item (quantity, unit_price).
 * Updates product stock based on quantity change.
 * Admin only.
 */
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { quantity, unit_price } = req.body;
        const existingItem = await OrderItem.findById(req.params.id);
        if (!existingItem) return res.status(404).json({ message: 'Order item not found' });

        // Update the order item
        const updated = await OrderItem.update(req.params.id, { quantity, unit_price });
        if (!updated) return res.status(400).json({ message: 'No changes made' });

        // Adjust product stock
        const quantityDifference = quantity - existingItem.quantity; // positive = more consumed, negative = returned
        const product = await Product.findById(existingItem.product_id);
        await Product.updateStock(existingItem.product_id, product.stock_quantity - quantityDifference);

        const updatedItem = await OrderItem.findById(req.params.id);
        res.json(updatedItem);

    } catch (err) {
        console.error('Update order item error:', err);
        res.status(500).json({ error: err.message });
    }
});



/**
 * DELETE /:id
 * Delete an order item by ID.
 * Updates product stock accordingly.
 * Admin only.
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        // שליפת פריט ההזמנה
        const existingItem = await OrderItem.findById(req.params.id);
        if (!existingItem) {
            return res.status(404).json({ message: 'Order item not found' });
        }

        // החזרת מלאי למוצר
        const product = await Product.findById(existingItem.product_id);
        const newStock = product.stock_quantity + existingItem.quantity;
        await Product.updateStock(existingItem.product_id, newStock);

        // מחיקת הפריט מהטבלה
        await OrderItem.delete(req.params.id);

        res.json({ message: 'Order item deleted successfully' });
    } catch (err) {
        console.error('Delete order item error:', err);
        res.status(500).json({ error: err.message });
    }
});



/**
 * GET /order/:orderId
 * Fetch all items of a specific order.
 * Admins can view any order. Regular users can view only their own orders.
 */
router.get('/order/:orderId', authenticateToken, async (req, res) => {
    try {
        const orderId = req.params.orderId;

        // If user is not admin, check ownership
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
