// models/Order.js
const { pool } = require('../config/database');

class Order {
    static async findAll(filters = {}) {
        let query = `
            SELECT o.*, u.first_name, u.last_name, u.email,
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

    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT o.*, u.first_name, u.last_name, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByOrderNumber(orderNumber) {
        const [rows] = await pool.execute('SELECT * FROM orders WHERE order_number = ?', [orderNumber]);
        return rows[0];
    }

    static async create(orderData) {
        const { user_id, total_amount, discount_amount = 0, tax_amount = 0, delivery_fee = 0, 
                delivery_address, delivery_phone, notes, payment_method } = orderData;
        
        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        const [result] = await pool.execute(
            `INSERT INTO orders (user_id, order_number, total_amount, discount_amount, tax_amount, 
             delivery_fee, delivery_address, delivery_phone, notes, payment_method) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, orderNumber, total_amount, discount_amount, tax_amount, delivery_fee, 
             delivery_address, delivery_phone, notes, payment_method]
        );
        return result.insertId;
    }

    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    static async updatePaymentStatus(id, paymentStatus) {
        const [result] = await pool.execute(
            'UPDATE orders SET payment_status = ? WHERE id = ?',
            [paymentStatus, id]
        );
        return result.affectedRows > 0;
    }

    static async getOrderItems(orderId) {
        const [rows] = await pool.execute(`
            SELECT oi.*, p.name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);
        return rows;
    }

    static async addOrderItem(orderItemData) {
        const { order_id, product_id, quantity, unit_price } = orderItemData;
        const total_price = quantity * unit_price;
        
        const [result] = await pool.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)',
            [order_id, product_id, quantity, unit_price, total_price]
        );
        return result.insertId;
    }

    static async getUserOrdersCount(userId) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
            [userId]
        );
        return rows[0].count;
    }

    static async getTotalSales(dateFrom, dateTo) {
        let query = 'SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "paid"';
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
}

module.exports = Order;