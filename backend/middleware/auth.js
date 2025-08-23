/**
 * Authentication and Authorization Middleware
 *
 * This module provides middleware functions for handling JWT-based authentication
 * and role-based authorization in an Express application.
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate a request using a JWT token.
 * 
 * It expects the token to be in the Authorization header in the format:
 *   Authorization: Bearer <token>
 * 
 * On success, `req.user` will contain the decoded user information.
 * On failure, responds with 401 (missing token) or 403 (invalid/expired token).
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
const authenticateToken = (req, res, next) => {
    console.log('Headers:', req.headers);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token found:', token);

    if (!token) {
        console.log('No token sent!');
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
        if (err) {
            console.log('Token invalid or expired:', err);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user; // Attach user info to request
        console.log('Token valid, user:', user);
        next();
    });
};

/**
 * Middleware generator for role-based authorization.
 * 
 * Allows access only to users whose role matches one of the allowed roles.
 *
 * @param {Array<string>} roles - Array of allowed roles (e.g., ['admin', 'customer'])
 * @returns {Function} Express middleware function
 */
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Access denied. Required roles: ${roles.join(', ')}` 
            });
        }

        next();
    };
};

/**
 * Optional authentication middleware.
 * 
 * If a valid JWT token is present in the Authorization header, attaches
 * the decoded user to `req.user`. Otherwise, continues without blocking.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
};

module.exports = { 
    authenticateToken, 
    authorizeRole, 
    optionalAuth 
};
