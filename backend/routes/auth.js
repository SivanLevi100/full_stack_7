/**
 * Auth Routes
 * 
 * Handles user authentication:
 * - POST /login : User login
 * - POST /register : User registration
 * 
 * Note: GET routes are defined only to prevent accidental access.
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * POST /login
 * Authenticate a user with email and password.
 * Returns a JWT token on success.
 */
router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login request body:', req.body);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('❌ Missing login fields');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findByEmail(email);
        console.log('👤 Found user:', user ? 'YES' : 'NO');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await User.verifyPassword(user.id, password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Extract relevant user info for response
        const { id, full_name, phone, role } = user;
        const userInfo = { id, full_name, email: user.email, phone, role };

        // Sign JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '24h' }
        );

        res.json({ 
            message: 'Login successful', 
            user: userInfo,
            token: token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /register
 * Register a new user.
 * Accepts: email, password, full_name, phone, role
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, phone, role } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Check if the user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Create new user
        const userId = await User.create({
            email,
            password,
            full_name,
            phone,
            role
        });

        res.status(201).json({ 
            message: 'User registered successfully',
            userId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /login
 * Prevent GET access. Only POST is allowed.
 */
router.get('/login', (req, res) => {
    res.send('Login route is POST only. Use POST with JSON body.');
});

/**
 * GET /register
 * Prevent GET access. Only POST is allowed.
 */
router.get('/register', (req, res) => {
    res.send('Register route is POST only. Use POST with JSON body.');
});

module.exports = router;
