/**
 * Users Routes
 * 
 * Routes:
 * - GET /              : Get all users (admin only)
 * - GET /:id           : Get user by ID (admin or self)
 * - POST /             : Create user (any authenticated user)
 * - PUT /:id           : Update user (admin or self)
 * - DELETE /:id        : Deactivate user (admin only)
 * - PUT /:id/password  : Change password (self only)
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * GET /
 * Get all users (admin only)
 */
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        console.error('Get users error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /:id
 * Get user by ID (admin or self)
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /
 * Create a new user
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = await User.create(req.body);
        const user = await User.findById(userId);
        res.status(201).json(user);
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /:id
 * Update user info (admin or self)
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const success = await User.update(req.params.id, req.body);
        if (!success) return res.status(404).json({ message: 'User not found' });

        const user = await User.findById(req.params.id);
        res.json(user);
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * DELETE /:id
 * Deactivate user (admin only)
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const success = await User.delete(req.params.id);
        if (!success) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deactivated successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PUT /:id/password
 * Change user password (self only)
 */
router.put('/:id/password', authenticateToken, async (req, res) => {
    try {
        if (req.user.id !== parseInt(req.params.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { currentPassword, newPassword } = req.body;

        // Verify current password
        const isValid = await User.verifyPassword(req.params.id, currentPassword);
        if (!isValid) return res.status(400).json({ error: 'Current password is incorrect' });

        await User.updatePassword(req.params.id, newPassword);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Update password error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
