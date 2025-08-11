const { pool } = require('../config/database');

class Product {
    static async findAll(filters = {}) {
        let query = `
            SELECT p.*, c.name as category_name, i.quantity as stock_quantity,
                   CASE WHEN i.quantity <= i.minimum_stock THEN 1 ELSE 0 END as low_stock
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE p.is_active = TRUE
        `;
        const params = [];

        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.search) {
            query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters.min_price) {
            query += ' AND p.price >= ?';
            params.push(filters.min_price);
        }

        if (filters.max_price) {
            query += ' AND p.price <= ?';
            params.push(filters.max_price);
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
            SELECT p.*, c.name as category_name, i.quantity as stock_quantity,
                   i.minimum_stock, i.maximum_stock, i.last_restock_date, i.expiry_date
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE p.id = ? AND p.is_active = TRUE
        `, [id]);
        return rows[0];
    }

    static async findByBarcode(barcode) {
        const [rows] = await pool.execute('SELECT * FROM products WHERE barcode = ? AND is_active = TRUE', [barcode]);
        return rows[0];
    }

    static async create(productData) {
        const { name, description, category_id, price, cost_price, brand, barcode, image_url, weight, unit } = productData;
        
        const [result] = await pool.execute(
            'INSERT INTO products (name, description, category_id, price, cost_price, brand, barcode, image_url, weight, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, category_id, price, cost_price, brand, barcode, image_url, weight, unit]
        );

        // Create initial inventory record
        await pool.execute(
            'INSERT INTO inventory (product_id, quantity, minimum_stock, maximum_stock) VALUES (?, 0, 10, 1000)',
            [result.insertId]
        );

        return result.insertId;
    }

    static async update(id, productData) {
        const { name, description, category_id, price, cost_price, brand, barcode, image_url, weight, unit } = productData;
        
        const [result] = await pool.execute(
            'UPDATE products SET name = ?, description = ?, category_id = ?, price = ?, cost_price = ?, brand = ?, barcode = ?, image_url = ?, weight = ?, unit = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, description, category_id, price, cost_price, brand, barcode, image_url, weight, unit, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('UPDATE products SET is_active = FALSE WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async updateStock(id, quantity) {
        const [result] = await pool.execute(
            'UPDATE inventory SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE product_id = ?',
            [quantity, id]
        );
        return result.affectedRows > 0;
    }

    static async getLowStockProducts() {
        const [rows] = await pool.execute(`
            SELECT p.*, i.quantity, i.minimum_stock 
            FROM products p
            JOIN inventory i ON p.id = i.product_id
            WHERE i.quantity <= i.minimum_stock AND p.is_active = TRUE
        `);
        return rows;
    }
}

module.exports = Product;
