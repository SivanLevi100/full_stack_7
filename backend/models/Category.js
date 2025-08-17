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

    /*static async create(categoryData) {
        const { name } = categoryData;
        const [result] = await pool.execute(
            'INSERT INTO categories (name) VALUES (?)',
            [name]
        );
        return result.insertId;
    }*/
    static async create(categoryData) {
        const { name } = categoryData;

        // 1. בדיקה אם קיימת קטגוריה עם שם זהה שכבויה (is_active = 0)
        const [existingRows] = await pool.execute(
            'SELECT id FROM categories WHERE name = ? AND is_active = 0',
            [name]
        );

        if (existingRows.length > 0) {
            const existingId = existingRows[0].id;
            // אם קיימת, הפעל אותה מחדש
            await pool.execute(
                'UPDATE categories SET is_active = 1 WHERE id = ?',
                [existingId]
            );
            return existingId; // מחזיר את ה-ID של הקטגוריה הקיימת
        }

        // 2. אחרת, צור קטגוריה חדשה
        const [result] = await pool.execute(
            'INSERT INTO categories (name, is_active) VALUES (?, 1)',
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
