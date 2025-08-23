/**
 * Product Model
 * 
 * Provides functions to manage products:
 * - Retrieve all products or a specific product
 * - Create, update, and delete products
 * - Manage stock quantity
 * - Check availability and retrieve low-stock products
 */

const { pool } = require('../config/database');

class Product {
    /**
     * Get all products with optional filters.
     * @param {Object} filters - Optional filters: category_id, search, min_price, max_price, in_stock, sort_by, sort_order, limit
     * @returns {Promise<Array>} - List of products with category info
     */
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

    /**
     * Get a product by its ID.
     * @param {number} id - Product ID
     * @returns {Promise<Object|null>} - Product object or null if not found
     */
    static async findById(id) {
        const [rows] = await pool.execute(`
            SELECT p.*, c.name as category_name
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    /**
     * Delete a product by ID.
     * @param {number} id - Product ID
     * @returns {Promise<boolean>} - True if deleted successfully
     */
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM products WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Create a new product.
     * @param {Object} productData - { name, category_id, price, image_url, stock_quantity }
     * @returns {Promise<number>} - Inserted product ID
     */
    static async create(productData) {
        const { name, category_id, price, image_url = null, stock_quantity = 0 } = productData;

        const [result] = await pool.execute(
            'INSERT INTO products (name, category_id, price, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?)',
            [name, category_id, price, image_url, stock_quantity]
        );

        return result.insertId;
    }

    /**
     * Update an existing product.
     * @param {number} id - Product ID
     * @param {Object} productData - Fields to update: name, category_id, price, stock_quantity, image_url (optional)
     * @returns {Promise<boolean>} - True if updated successfully
     */
    static async update(id, productData) {
        const productDataToUpdate = {
            name: productData.name,
            category_id: productData.category_id,
            price: productData.price,
            stock_quantity: productData.stock_quantity
        };

        if (productData.image_url) {
            productDataToUpdate.image_url = productData.image_url;
        }

        const fields = [];
        const params = [];
        for (const [key, value] of Object.entries(productDataToUpdate)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                params.push(value);
            }
        }

        if (fields.length === 0) return false;

        params.push(id);

        const [result] = await pool.execute(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            params
        );

        return result.affectedRows > 0;
    }

    /**
     * Update the stock quantity of a product.
     * @param {number} id - Product ID
     * @param {number} quantity - New stock quantity
     * @returns {Promise<boolean>}
     */
    static async updateStock(id, quantity) {
        const [result] = await pool.execute(
            'UPDATE products SET stock_quantity = ? WHERE id = ?',
            [quantity, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Decrease stock quantity by a specified amount.
     * @param {number} id - Product ID
     * @param {number} quantity - Quantity to decrease
     * @returns {Promise<boolean>} - True if stock updated successfully
     */
    static async decreaseStock(id, quantity) {
        const [result] = await pool.execute(
            'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
            [quantity, id, quantity]
        );
        return result.affectedRows > 0;
    }

    /**
     * Increase stock quantity by a specified amount.
     * @param {number} id - Product ID
     * @param {number} quantity - Quantity to increase
     * @returns {Promise<boolean>}
     */
    static async increaseStock(id, quantity) {
        const [result] = await pool.execute(
            'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
            [quantity, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Get products with stock below a specified threshold.
     * @param {number} threshold - Stock threshold (default 10)
     * @returns {Promise<Array>} - List of low-stock products
     */
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

    /**
     * Check if a product has sufficient stock for a requested quantity.
     * @param {number} id - Product ID
     * @param {number} quantity - Requested quantity
     * @returns {Promise<boolean>} - True if available
     */
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
