/**
 * Category Model
 * 
 * Provides functions to manage product categories:
 * - Retrieve all categories or a specific category
 * - Create, update, and soft-delete categories
 * - Count products in a category
 */

const { pool } = require('../config/database');

class Category {
    /**
     * Get all active categories.
     * @returns {Promise<Array>} - List of categories
     */
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE is_active = TRUE ORDER BY name'
        );
        return rows;
    }

    /**
     * Get a single category by ID.
     * @param {number} id - Category ID
     * @returns {Promise<Object|null>} - Category object or null if not found
     */
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM categories WHERE id = ? AND is_active = TRUE',
            [id]
        );
        return rows[0];
    }

    /**
     * Create a new category.
     * If a category with the same name exists but is inactive, it reactivates it.
     * @param {Object} categoryData - { name: string }
     * @returns {Promise<number>} - ID of the new or reactivated category
     */
    static async create(categoryData) {
        const { name } = categoryData;

        // Check if an inactive category with the same name exists
        const [existingRows] = await pool.execute(
            'SELECT id FROM categories WHERE name = ? AND is_active = 0',
            [name]
        );

        if (existingRows.length > 0) {
            const existingId = existingRows[0].id;
            // Reactivate existing category
            await pool.execute(
                'UPDATE categories SET is_active = 1 WHERE id = ?',
                [existingId]
            );
            return existingId;
        }

        // Otherwise, create a new category
        const [result] = await pool.execute(
            'INSERT INTO categories (name, is_active) VALUES (?, 1)',
            [name]
        );
        return result.insertId;
    }

    /**
     * Update the name of an existing category.
     * @param {number} id - Category ID
     * @param {Object} categoryData - { name: string }
     * @returns {Promise<boolean>} - True if updated successfully
     */
    static async update(id, categoryData) {
        const { name } = categoryData;
        const [result] = await pool.execute(
            'UPDATE categories SET name = ? WHERE id = ?',
            [name, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Soft-delete a category by setting is_active to FALSE.
     * @param {number} id - Category ID
     * @returns {Promise<boolean>} - True if deleted successfully
     */
    static async delete(id) {
        const [result] = await pool.execute(
            'UPDATE categories SET is_active = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Get the count of products in a specific category.
     * @param {number} id - Category ID
     * @returns {Promise<number>} - Number of products in the category
     */
    static async getProductsCount(id) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
            [id]
        );
        return rows[0].count;
    }
}

module.exports = Category;
