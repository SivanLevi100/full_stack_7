// models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT id, email, full_name, phone, role, created_at FROM users ORDER BY id'
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT id, email, password, full_name, role FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async create(userData) {
        const { email, password, full_name, phone, role = 'customer' } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            'INSERT INTO users (email, password, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, full_name, phone, role]
        );
        return result.insertId;
    }

    static async update(id, userData) {
        const { full_name, phone } = userData;
        const [result] = await pool.execute(
            'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
            [full_name, phone, id]
        );
        return result.affectedRows > 0;
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }

    static async verifyPassword(id, password) {
        const [rows] = await pool.execute('SELECT password, role FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return false;

        const user = rows[0];

        // אם מנהל - השוואה פשוטה ל־plain text
        if (user.role === 'admin') {
            return user.password === password;
        }

        // אחרת - השוואה עם bcrypt
        return await bcrypt.compare(password, user.password);
    }

    static async delete(id) {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

}

module.exports = User;
