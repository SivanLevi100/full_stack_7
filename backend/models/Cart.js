// models/Cart.js
const { pool } = require('../config/database');

class Cart {
    static async getCartItems(userId) {
        const [rows] = await pool.execute(`
            SELECT sc.*, p.name, p.price, p.image_url, p.unit,
                   (sc.quantity * p.price) as total_price,
                   i.quantity as stock_quantity
            FROM shopping_cart sc
            JOIN products p ON sc.product_id = p.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE sc.user_id = ? AND p.is_active = TRUE
            ORDER BY sc.added_at DESC
        `, [userId]);
        return rows;
    }

    static async addItem(userId, productId, quantity = 1) {
        // Check if item already exists in cart
        const [existing] = await pool.execute(
            'SELECT id, quantity FROM shopping_cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Update quantity
            const newQuantity = existing[0].quantity + quantity;
            const [result] = await pool.execute(
                'UPDATE shopping_cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newQuantity, existing[0].id]
            );
            return result.affectedRows > 0;
        } else {
            // Add new item
            const [result] = await pool.execute(
                'INSERT INTO shopping_cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
            return result.insertId;
        }
    }

    static async updateQuantity(userId, productId, quantity) {
        const [result] = await pool.execute(
            'UPDATE shopping_cart SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
        return result.affectedRows > 0;
    }

    static async removeItem(userId, productId) {
        const [result] = await pool.execute(
            'DELETE FROM shopping_cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result.affectedRows > 0;
    }

    static async clearCart(userId) {
        const [result] = await pool.execute(
            'DELETE FROM shopping_cart WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows > 0;
    }

    static async getCartTotal(userId) {
        const [rows] = await pool.execute(`
            SELECT SUM(sc.quantity * p.price) as total
            FROM shopping_cart sc
            JOIN products p ON sc.product_id = p.id
            WHERE sc.user_id = ? AND p.is_active = TRUE
        `, [userId]);
        return rows[0].total || 0;
    }

    static async getCartItemsCount(userId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM shopping_cart WHERE user_id = ?',
            [userId]
        );
        return rows[0].count;
    }
}

module.exports = Cart;