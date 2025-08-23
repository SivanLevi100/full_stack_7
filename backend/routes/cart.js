/**
 * Cart Routes
 * 
 * Handles operations on the user's shopping cart:
 * - GET /         : Get all cart items for the current user
 * - POST /add     : Add a new item to the cart (or increase quantity if already exists)
 * - PUT /update   : Update the quantity of an existing cart item
 * - DELETE /remove/:product_id : Remove a specific item from the cart
 * - DELETE /clear : Clear all items from the cart
 * - GET /count    : Get the total number of items in the cart
 */

const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /
 * Fetch all cart items for the current authenticated user.
 * Returns the items and the total price.
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const items = await Cart.getCartItems(req.user.id);
        const total = await Cart.getCartTotal(req.user.id);
        res.json({ items, total });
    } catch (err) {
        console.error('Get cart items error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /add
 * Add an item to the cart, or increase quantity if it already exists.
 * Expects: product_id and optional quantity (defaults to 1).
 */
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

        const qty = quantity && quantity > 0 ? quantity : 1;
        const result = await Cart.addItem(req.user.id, product_id, qty);

        if (!result) return res.status(500).json({ error: 'Failed to add item to cart' });

        const items = await Cart.getCartItems(req.user.id);
        const total = await Cart.getCartTotal(req.user.id);
        res.json({ message: 'Item added to cart', items, total });
    } catch (err) {
        console.error('Add item to cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /update
 * Update the quantity of an item in the cart.
 * Expects: product_id and quantity (must be >= 1)
 */
router.put('/update', authenticateToken, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        if (!product_id || quantity == null) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }
        if (quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        const success = await Cart.updateQuantity(req.user.id, product_id, quantity);
        if (!success) return res.status(404).json({ error: 'Item not found in cart' });

        const items = await Cart.getCartItems(req.user.id);
        const total = await Cart.getCartTotal(req.user.id);
        res.json({ message: 'Cart updated', items, total });
    } catch (err) {
        console.error('Update cart item error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /remove/:product_id
 * Remove a specific item from the cart by product ID.
 */
router.delete('/remove/:product_id', authenticateToken, async (req, res) => {
    try {
        const productId = req.params.product_id;
        const success = await Cart.removeItem(req.user.id, productId);
        if (!success) return res.status(404).json({ error: 'Item not found in cart' });

        const items = await Cart.getCartItems(req.user.id);
        const total = await Cart.getCartTotal(req.user.id);
        res.json({ message: 'Item removed from cart', items, total });
    } catch (err) {
        console.error('Remove cart item error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /clear
 * Clear all items from the current user's cart.
 */
router.delete('/clear', authenticateToken, async (req, res) => {
    try {
        const success = await Cart.clearCart(req.user.id);
        if (!success) return res.status(404).json({ error: 'Cart is already empty' });
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /count
 * Get the total number of items in the current user's cart.
 * Useful for displaying in the navbar or cart icon.
 */
router.get('/count', authenticateToken, async (req, res) => {
    try {
        const count = await Cart.getCartItemsCount(req.user.id);
        res.json({ count });
    } catch (err) {
        console.error('Get cart count error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
