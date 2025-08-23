/**
 * Cart Model
 * 
 * Provides functions to manage a shopping cart:
 * - Retrieve cart items
 * - Add, update, and remove items
 * - Calculate total price
 * - Validate stock availability
 */

const { pool } = require('../config/database');

class Cart {
    /**
     * Get all cart items for a specific user.
     * @param {number} userId - ID of the user
     * @returns {Promise<Array>} - List of items with product info and total price per item
     */
    static async getCartItems(userId) {
        const [rows] = await pool.execute(`
            SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity,
                   (c.quantity * p.price) as total_price
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.added_at DESC
        `, [userId]);
        return rows;
    }

    /**
     * Add a product to the cart or update its quantity if it already exists.
     * @param {number} userId 
     * @param {number} productId 
     * @param {number} quantity 
     * @returns {Promise<number|boolean>} - insertId if a new item, true if quantity updated
     */
    static async addItem(userId, productId, quantity = 1) {
        const [existing] = await pool.execute(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            const newQuantity = existing[0].quantity + quantity;
            const [result] = await pool.execute(
                'UPDATE cart SET quantity = ? WHERE id = ?',
                [newQuantity, existing[0].id]
            );
            return result.affectedRows > 0;
        } else {
            const [result] = await pool.execute(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
            return result.insertId;
        }
    }

    /**
     * Update the quantity of a cart item.
     * @param {number} userId 
     * @param {number} productId 
     * @param {number} quantity 
     * @returns {Promise<boolean>} - true if updated, false otherwise
     */
    static async updateQuantity(userId, productId, quantity) {
        if (quantity <= 0) {
            return await this.removeItem(userId, productId);
        }
        const [result] = await pool.execute(
            'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Remove a product from the cart.
     * @param {number} userId 
     * @param {number} productId 
     * @returns {Promise<boolean>}
     */
    static async removeItem(userId, productId) {
        const [result] = await pool.execute(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Clear all items from a user's cart.
     * @param {number} userId 
     * @returns {Promise<boolean>}
     */
    static async clearCart(userId) {
        const [result] = await pool.execute(
            'DELETE FROM cart WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Get the total price of all items in the cart.
     * @param {number} userId 
     * @returns {Promise<number>} - Total price
     */
    static async getCartTotal(userId) {
        const [rows] = await pool.execute(`
            SELECT SUM(c.quantity * p.price) as total
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [userId]);
        return rows[0].total || 0;
    }

    /**
     * Get the count of items in the cart.
     * @param {number} userId 
     * @returns {Promise<number>}
     */
    static async getCartItemsCount(userId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM cart WHERE user_id = ?',
            [userId]
        );
        return rows[0].count;
    }

    /**
     * Validate cart items against available stock.
     * @param {number} userId 
     * @returns {Promise<Array>} - List of items with insufficient stock
     */
    static async validateCart(userId) {
        const [rows] = await pool.execute(`
            SELECT c.product_id, c.quantity, p.stock_quantity, p.name
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [userId]);

        const unavailable = [];
        for (const item of rows) {
            if (item.stock_quantity < item.quantity) {
                unavailable.push({
                    product_id: item.product_id,
                    name: item.name,
                    requested: item.quantity,
                    available: item.stock_quantity
                });
            }
        }
        return unavailable;
    }
}

module.exports = Cart;
