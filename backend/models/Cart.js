// models/Cart.js
const { pool } = require('../config/database');

class Cart {
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

    static async addItem(userId, productId, quantity = 1) {
        // בדוק אם המוצר כבר קיים בעגלה
        const [existing] = await pool.execute(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // עדכן כמות
            const newQuantity = existing[0].quantity + quantity;
            const [result] = await pool.execute(
                'UPDATE cart SET quantity = ? WHERE id = ?',
                [newQuantity, existing[0].id]
            );
            return result.affectedRows > 0;
        } else {
            // הוסף פריט חדש
            const [result] = await pool.execute(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [userId, productId, quantity]
            );
            return result.insertId;
        }
    }

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

    static async removeItem(userId, productId) {
        const [result] = await pool.execute(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );
        return result.affectedRows > 0;
    }

    static async clearCart(userId) {
        const [result] = await pool.execute(
            'DELETE FROM cart WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows > 0;
    }

    static async getCartTotal(userId) {
        const [rows] = await pool.execute(`
            SELECT SUM(c.quantity * p.price) as total
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [userId]);
        return rows[0].total || 0;
    }

    static async getCartItemsCount(userId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM cart WHERE user_id = ?',
            [userId]
        );
        return rows[0].count;
    }

    static async validateCart(userId) {
        // בדוק זמינות מלאי לכל הפריטים בעגלה
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