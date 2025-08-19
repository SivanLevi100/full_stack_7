// models/Order.js
const { pool } = require('../config/database');

class Order {
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

    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT o.*, u.full_name, u.email
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
        const { user_id, total_amount } = orderData;

        const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

        const [result] = await pool.execute(
            'INSERT INTO orders (user_id, order_number, total_amount) VALUES (?, ?, ?)',
            [user_id, orderNumber, total_amount]
        );
        return { orderId: result.insertId, orderNumber };
    }

    static async updateStatus(id, status) {
        const [result] = await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
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

        const [result] = await pool.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
            [order_id, product_id, quantity, unit_price]
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

    // פונקציה חדשה: יצירת הזמנה מהעגלה
    static async createFromCart(userId) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // קבל פריטים מהעגלה
            const [cartItems] = await connection.execute(`
                SELECT c.product_id, c.quantity, p.price, p.stock_quantity
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            `, [userId]);

            if (cartItems.length === 0) {
                throw new Error('העגלה ריקה');
            }

            // בדוק זמינות מלאי
            for (const item of cartItems) {
                if (item.stock_quantity < item.quantity) {
                    throw new Error(`אין מספיק מלאי למוצר ${item.product_id}`);
                }
            }

            // חשב סה"כ
            const totalAmount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

            // צור הזמנה
            const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            const [orderResult] = await connection.execute(
                'INSERT INTO orders (user_id, order_number, total_amount) VALUES (?, ?, ?)',
                [userId, orderNumber, totalAmount]
            );

            const orderId = orderResult.insertId;

            // הוסף פריטי הזמנה ועדכן מלאי
            for (const item of cartItems) {
                // הוסף לפריטי הזמנה
                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                    [orderId, item.product_id, item.quantity, item.price]
                );

                // עדכן מלאי
                await connection.execute(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // נקה עגלה
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

    static async delete(id) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // שליפת פריטי ההזמנה כדי לעדכן מלאי
            const [items] = await connection.execute(
                'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
                [id]
            );

            // החזרת מלאי לכל מוצר
            for (const item of items) {
                await connection.execute(
                    'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }

            // מחיקת פריטי הזמנה
            await connection.execute('DELETE FROM order_items WHERE order_id = ?', [id]);


            //או לעדכן סטטוס updateStatus לבוטל
            // מחיקת ההזמנה עצמה
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
    //פונק עזר
    static async updateTotals(orderId) {
        // מחשב מחדש את הסכום הכולל ואת סה"כ הפריטים
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

}

module.exports = Order;