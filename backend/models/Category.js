// models/Category.js
const { pool } = require('../config/database');

class Category {
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name'
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE id = ? AND is_active = TRUE',
            [id]
        );
        return rows[0];
    }

    static async create(categoryData) {
        const { name } = categoryData;
        const [result] = await pool.execute(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );
        return result.insertId;
    }

    static async update(id, categoryData) {
        const { name } = categoryData;
        const [result] = await pool.execute(
            'UPDATE categories SET name = ? WHERE id = ?',
            [name, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getProductsCount(id) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [id]
        );
        return rows[0].count;
    }
}

module.exports = Category;
