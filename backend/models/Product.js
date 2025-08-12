// models/Product.js
const { pool } = require('../config/database');

class Product {
    static async findAll(filters = {}) {
        let query = `
            SELECT p.*, c.name as category_name
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.search) {
            query += ' AND p.name LIKE ?';
            params.push(`%${filters.search}%`);
        }

        if (filters.min_price) {
            query += ' AND p.price >= ?';
            params.push(filters.min_price);
        }

        if (filters.max_price) {
            query += ' AND p.price <= ?';
            params.push(filters.max_price);
        }

        if (filters.in_stock) {
            query += ' AND p.stock_quantity > 0';
        }

        query += ` ORDER BY ${filters.sort_by || 'p.name'} ${filters.sort_order || 'ASC'}`;

        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
        }

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT p.*, c.name as category_name
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(productData) {
        const { name, category_id, price, image_url, stock_quantity = 0 } = productData;
        
        const [result] = await pool.execute(
            'INSERT INTO products (name, category_id, price, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?)',
            [name, category_id, price, image_url, stock_quantity]
        );

        return result.insertId;
    }

    static async update(id, productData) {
        const { name, category_id, price, image_url, stock_quantity } = productData;
        
        const [result] = await pool.execute(
            'UPDATE products SET name = ?, category_id = ?, price = ?, image_url = ?, stock_quantity = ? WHERE id = ?',
            [name, category_id, price, image_url, stock_quantity, id]
        );
        return result.affectedRows > 0;
    }

    static async updateStock(id, quantity) {
        const [result] = await pool.execute(
            'UPDATE products SET stock_quantity = ? WHERE id = ?',
            [quantity, id]
        );
        return result.affectedRows > 0;
    }

    static async decreaseStock(id, quantity) {
        const [result] = await pool.execute(
            'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
            [quantity, id, quantity]
        );
        return result.affectedRows > 0;
    }

    static async increaseStock(id, quantity) {
        const [result] = await pool.execute(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [quantity, id]
        );
        return result.affectedRows > 0;
    }

    static async getLowStockProducts(threshold = 10) {
        const [rows] = await pool.execute(`
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.stock_quantity <= ?
            ORDER BY p.stock_quantity ASC
        `, [threshold]);
        return rows;
    }

    static async checkAvailability(id, quantity) {
        const [rows] = await pool.execute(
            'SELECT stock_quantity FROM products WHERE id = ?',
            [id]
        );
        if (rows.length === 0) return false;
        return rows[0].stock_quantity >= quantity;
    }
}

module.exports = Product;
