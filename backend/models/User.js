/**
 * User Model
 * 
 * Provides functions to manage users:
 * - Retrieve all users or a specific user
 * - Create, update, and delete users
 * - Verify passwords and update password securely
 */

const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    /**
     * Get all users.
     * @returns {Promise<Array>} - List of users (id, email, full_name, phone, role, created_at)
     */
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT id, email, full_name, phone, role, created_at FROM users ORDER BY id'
        );
        return rows;
    }

    /**
     * Get a user by ID.
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} - User object or null if not found
     */
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    /**
     * Get a user by email.
     * @param {string} email - User email
     * @returns {Promise<Object|null>} - User object including password hash, or null if not found
     */
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT id, email, password, full_name, role FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    /**
     * Create a new user.
     * @param {Object} userData - { email, password, full_name, phone, role }
     * @returns {Promise<number>} - Inserted user ID
     */
    static async create(userData) {
        const { email, password, full_name, phone, role = 'customer' } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, full_name, phone, role]
        );
        return result.insertId;
    }

    /**
     * Update user details (excluding password).
     * @param {number} id - User ID
     * @param {Object} userData - { full_name, phone }
     * @returns {Promise<boolean>} - True if updated successfully
     */
    static async update(id, userData) {
        const { full_name, phone } = userData;
        const [result] = await pool.execute(
            'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
            [full_name, phone, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Update user password.
     * @param {number} id - User ID
     * @param {string} newPassword - New password (will be hashed)
     * @returns {Promise<boolean>} - True if updated successfully
     */
    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Verify a user's password.
     * @param {number} id - User ID
     * @param {string} password - Plain-text password to verify
     * @returns {Promise<boolean>} - True if password matches
     */
    static async verifyPassword(id, password) {
        const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return false;

        const user = rows[0];
        return await bcrypt.compare(password, user.password);
    }

    /**
     * Delete a user by ID.
     * @param {number} id - User ID
     * @returns {Promise<boolean>} - True if deleted successfully
     */
    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;
