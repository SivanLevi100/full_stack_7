/**
 * Order Model
 * 
 * Provides functions to manage orders:
 * - Retrieve all orders or specific orders
 * - Create new orders (including from a user's cart)
 * - Update order status or totals
 * - Delete orders while restoring stock
 * - Retrieve order items and total sales
 */

const { pool } = require('../config/database');

class Order {
    /**
     * Get all orders with optional filters.
     * @param {Object} filters - Optional filters: user_id, status, date_from, date_to
     * @returns {Promise<Array>} - List of orders with user info and total items
     */
    static async findAll(filters = {}) {
        let query = `
            SELECT o.*, u.full_name, u.email,
                   COUNT(oi.id) as total_items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
        `;
        const params = [];
        let whereConditions = [];

        if (filters.user_id) {
            whereConditions.push('o.user_id = ?');
            params.push(filters.user_id);
        }

        if (filters.status) {
            whereConditions.push('o.status = ?');
            params.push(filters.status);
        }

        if (filters.date_from) {
            whereConditions.push('DATE(o.order_date) >= ?');
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            whereConditions.push('DATE(o.order_date) <= ?');
            params.push(filters.date_to);
        }

        if (whereConditions.length > 0) {
            query += ' WHERE ' + whereConditions.join(' AND ');
        }

        query += ' GROUP BY o.id ORDER BY o.order_date DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    /**
     * Get a single order by ID.
     * @param {number} id - Order ID
     * @returns {Promise<Object|null>} - Order object or null if not found
     */
    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT o.*, u.full_name, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);
        return rows[0];
    }

    /**
     * Get a single order by its order number.
     * @param {string} orderNumber - Order number
     * @returns {Promise<Object|null>} - Order object or null if not found
     */
    static async findByOrderNumber(orderNumber) {
        const [rows] = await pool.execute(
            'SELECT * FROM orders WHERE order_number = ?',
            [orderNumber]
        );
        return rows[0];
    }

    /**
     * Create a new order.
     * @param {Object} orderData - { user_id: number, total_amount: number }
     * @returns {Promise<Object>} - { orderId, orderNumber }
     */
    static async create(orderData) {
        const { user_id, total_amount } = orderData;
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const [result] = await pool.execute(
            'INSERT INTO orders (user_id, order_number, total_amount) VALUES (?, ?, ?)',
            [user_id, orderNumber, total_amount]
        );
        return { orderId: result.insertId, orderNumber };
    }

    /**
     * Update the status of an order.
     * @param {number} id - Order ID
     * @param {string} status - New status
     * @returns {Promise<boolean>} - True if updated successfully
     */
    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Get items of a specific order.
     * @param {number} orderId - Order ID
     * @returns {Promise<Array>} - List of order items with product info
     */
    static async getOrderItems(orderId) {
        const [rows] = await pool.execute(`
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);
        return rows;
    }

    /**
     * Add a single item to an order.
     * @param {Object} orderItemData - { order_id, product_id, quantity, unit_price }
     * @returns {Promise<number>} - Inserted order item ID
     */
    static async addOrderItem(orderItemData) {
        const { order_id, product_id, quantity, unit_price } = orderItemData;
        const [result] = await pool.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [order_id, product_id, quantity, unit_price]
        );
        return result.insertId;
    }

    /**
     * Get total number of orders for a user.
     * @param {number} userId - User ID
     * @returns {Promise<number>} - Total orders count
     */
    static async getUserOrdersCount(userId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
            [userId]
        );
        return rows[0].count;
    }

    /**
     * Get total sales within a date range (excluding cancelled orders).
     * @param {string} [dateFrom] - Optional start date (YYYY-MM-DD)
     * @param {string} [dateTo] - Optional end date (YYYY-MM-DD)
     * @returns {Promise<number>} - Total sales amount
     */
    static async getTotalSales(dateFrom, dateTo) {
        let query = 'SELECT SUM(total_amount) as total FROM orders WHERE status != "cancelled"';
        const params = [];

        if (dateFrom) {
            query += ' AND DATE(order_date) >= ?';
            params.push(dateFrom);
        }

        if (dateTo) {
            query += ' AND DATE(order_date) <= ?';
            params.push(dateTo);
        }

        const [rows] = await pool.execute(query, params);
        return rows[0].total || 0;
    }

    /**
     * Create an order from the user's cart.
     * Checks stock, calculates total, adds order items, updates stock, and clears cart.
     * @param {number} userId - User ID
     * @returns {Promise<Object>} - { orderId, orderNumber, totalAmount }
     */
    static async createFromCart(userId) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // Fetch cart items
            const [cartItems] = await connection.execute(`
                SELECT c.product_id, c.quantity, p.price, p.stock_quantity
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            `, [userId]);

            if (cartItems.length === 0) {
                throw new Error('Cart is empty');
            }

            // Check stock availability
            for (const item of cartItems) {
                if (item.stock_quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product ${item.product_id}`);
                }
            }

            // Calculate total
            const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

            // Create order
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            const [orderResult] = await connection.execute(
                'INSERT INTO orders (user_id, order_number, total_amount) VALUES (?, ?, ?)',
                [userId, orderNumber, totalAmount]
            );

            const orderId = orderResult.insertId;

            // Add order items and update stock
            for (const item of cartItems) {
                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price]
                );

                await connection.execute(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // Clear cart
            await connection.execute('DELETE FROM cart WHERE user_id = ?', [userId]);

            await connection.commit();
            return { orderId, orderNumber, totalAmount };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Delete an order and restore stock quantities.
     * @param {number} id - Order ID
     * @returns {Promise<boolean>} - True if deleted successfully
     */
    static async delete(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Fetch order items to restore stock
            const [items] = await connection.execute(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            // Restore stock
            for (const item of items) {
                await connection.execute(
                    'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // Delete order items
            await connection.execute('DELETE FROM order_items WHERE order_id = ?', [id]);

            // Delete order
            const [result] = await connection.execute(
                'DELETE FROM orders WHERE id = ?',
                [id]
            );

            await connection.commit();
            return result.affectedRows > 0;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }

    /**
     * Recalculate total items and total amount for an order.
     * @param {number} orderId - Order ID
     */
    static async updateTotals(orderId) {
        const [rows] = await pool.execute(
            `SELECT 
                SUM(quantity) as total_items, 
                SUM(quantity * unit_price) as total_amount
             FROM order_items 
             WHERE order_id = ?`,
            [orderId]
        );

        const total_items = rows[0].total_items || 0;
        const total_amount = rows[0].total_amount || 0;

        await pool.execute(
            `UPDATE orders 
             SET total_items = ?, total_amount = ? 
             WHERE id = ?`,
            [total_items, total_amount, orderId]
        );
    }

    /**
     * Update the total amount of an order.
     * @param {number} id - Order ID
     * @param {number} totalAmount - New total amount
     * @returns {Promise<boolean>} - True if updated successfully
     */
    static async updateTotal(id, totalAmount) {
        try {
            const [result] = await pool.execute(
                'UPDATE orders SET total_amount = ? WHERE id = ?',
                [totalAmount, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating order total:', error);
            throw error;
        }
    }
}

module.exports = Order;
