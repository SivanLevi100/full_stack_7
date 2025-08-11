const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT id, email, first_name, last_name, phone, address, city, zip_code, role, is_active, created_at FROM users ORDER BY id'
        );
        return rows;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, email, first_name, last_name, phone, address, city, zip_code, role, is_active, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT id, email, password, first_name, last_name, role, is_active FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async create(userData) {
        const { email, password, first_name, last_name, phone, address, city, zip_code, role = 'customer' } = userData;
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const [result] = await pool.execute(
            'INSERT INTO users (email, password, first_name, last_name, phone, address, city, zip_code, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, first_name, last_name, phone, address, city, zip_code, role]
        );
        return result.insertId;
    }

    static async update(id, userData) {
        const { first_name, last_name, phone, address, city, zip_code } = userData;
        const [result] = await pool.execute(
            'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, zip_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [first_name, last_name, phone, address, city, zip_code, id]
        );
        return result.affectedRows > 0;
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const [result] = await pool.execute(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async verifyPassword(id, password) {
        const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [id]);
        if (rows.length === 0) return false;
        return await bcrypt.compare(password, rows[0].password);
    }

    static async toggleActive(id) {
        const [result] = await pool.execute(
            'UPDATE users SET is_active = NOT is_active WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = User;
