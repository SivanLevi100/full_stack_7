/**
 * Database Configuration using MySQL2 Promise Pool
 *
 * This module sets up a connection pool to a MySQL database using
 * environment variables for configuration. It exports the pool
 * object for executing queries and a testConnection function
 * to verify connectivity.
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Create a MySQL connection pool
 * 
 * Configuration is loaded from environment variables:
 *  - DB_HOST: database host
 *  - DB_USER: database user
 *  - DB_PASSWORD: database password
 *  - DB_NAME: database name
 * 
 * Pool settings:
 *  - waitForConnections: true (queue connection requests when no connections are available)
 *  - connectionLimit: 10 (maximum number of connections in the pool)
 *  - queueLimit: 0 (unlimited queue)
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

/**
 * Test the database connection
 *
 * Attempts to get a connection from the pool and immediately releases it.
 * Logs success or failure to the console.
 *
 * @async
 * @function testConnection
 * @returns {Promise<void>}
 */
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

// Export the pool and testConnection function for external use
module.exports = { pool, testConnection };
