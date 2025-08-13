const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const { authenticateToken } = require('../middleware/auth');

// קבלת כל הפריטים בעגלה של המשתמש הנוכחי
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

// הוספת פריט חדש לעגלה (או הגדלת הכמות אם קיים)
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { product_id, quantity } = req.body;
        if (!product_id) return res.status(400).json({ error: 'Product ID is required' });

        const qty = quantity && quantity > 0 ? quantity : 1;
        const result = await Cart.addItem(req.user.id, product_id, qty);

        if (!result) {
            return res.status(500).json({ error: 'Failed to add item to cart' });
        }

        const items = await Cart.getCartItems(req.user.id);
        const total = await Cart.getCartTotal(req.user.id);
        res.json({ message: 'Item added to cart', items, total });
    } catch (err) {
        console.error('Add item to cart error:', err);
        res.status(500).json({ error: err.message });
    }
});

// עדכון כמות פריט בעגלה
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

// הסרת פריט מהעגלה
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

// ניקוי כל העגלה
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

// קבלת מספר הפריטים בעגלה (למשל עבור תצוגה בסרגל ניווט)
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
