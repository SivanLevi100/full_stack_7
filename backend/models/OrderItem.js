/**
 * OrderItem Model
 * 
 * Provides functions to manage order items:
 * - Retrieve all order items or specific items
 * - Create, update, and delete order items
 * - Retrieve items by order ID for reports or detailed views
 */

const { pool } = require('../config/database');

class OrderItem {
    /**
     * Get all order items with optional filters.
     * @param {Object} filters - Optional filters: order_id, product_id
     * @returns {Promise<Array>} - List of order items with product info
     */
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

    /**
     * Get a single order item by its ID.
     * @param {number} id - Order item ID
     * @returns {Promise<Object|null>} - Order item object or null if not found
     */
    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.id = ?
        `, [id]);
        return rows[0];
    }

    /**
     * Create a new order item.
     * @param {Object} orderItemData - { order_id, product_id, quantity, unit_price }
     * @returns {Promise<number>} - Inserted order item ID
     */
    static async create(orderItemData) {
        const { order_id, product_id, quantity, unit_price } = orderItemData;
        const [result] = await pool.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [order_id, product_id, quantity, unit_price]
        );
        return result.insertId;
    }

    /**
     * Update an existing order item.
     * @param {number} id - Order item ID
     * @param {Object} updateData - Fields to update: quantity, unit_price
     * @returns {Promise<boolean>} - True if updated successfully
     */
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

    /**
     * Delete an order item.
     * @param {number} id - Order item ID
     * @returns {Promise<boolean>} - True if deleted successfully
     */
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM order_items WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Get all order items for a specific order.
     * Useful for generating reports or detailed order views.
     * @param {number} orderId - Order ID
     * @returns {Promise<Array>} - List of order items with product info
     */
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
