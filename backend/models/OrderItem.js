// models/OrderItem.js
const { pool } = require('../config/database');

class OrderItem {
    // שליפת כל פריטי ההזמנה
    static async findAll(filters = {}) {
        let query = `
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
        `;
        const params = [];
        const whereConditions = [];

        if (filters.order_id) {
            whereConditions.push('oi.order_id = ?');
            params.push(filters.order_id);
        }

        if (filters.product_id) {
            whereConditions.push('oi.product_id = ?');
            params.push(filters.product_id);
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' ORDER BY oi.id DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // שליפת פריט הזמנה לפי ID
    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.id = ?
        `, [id]);
        return rows[0];
    }

    // הוספת פריט להזמנה
    static async create(orderItemData) {
        const { order_id, product_id, quantity, unit_price } = orderItemData;
        const [result] = await pool.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [order_id, product_id, quantity, unit_price]
        );
        return result.insertId;
    }

    // עדכון פריט הזמנה
    static async update(id, updateData) {
        const fields = [];
        const params = [];

        if (updateData.quantity !== undefined) {
            fields.push('quantity = ?');
            params.push(updateData.quantity);
        }
        if (updateData.unit_price !== undefined) {
            fields.push('unit_price = ?');
            params.push(updateData.unit_price);
        }

        if (fields.length === 0) {
            return false;
        }

        params.push(id);

        const [result] = await pool.execute(
            `UPDATE order_items SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    }

    // מחיקת פריט הזמנה
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM order_items WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // שליפת פריטים לפי מספר ההזמנה (שימושי לדוחות)
    static async findByOrderId(orderId) {
        const [rows] = await pool.execute(`
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);
        return rows;
    }
}

module.exports = OrderItem;
