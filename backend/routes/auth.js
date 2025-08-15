// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Login
router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login request body:', req.body);
        
        const { email, password } = req.body;
        
        console.log('🔍 Login fields:');
        console.log('email:', email);
        console.log('password:', password);
        
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

        // הימנע מהגדרה כפולה של email
        const { id, full_name, phone, role } = user;
        const userInfo = { id, full_name, email: user.email, phone, role };

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
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

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password,full_name, phone} = req.body;
        
        if (!password || !email) {
            return res.status(400).json({ error: 'Password and email are required' });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Create user
        const userId = await User.create({
            email: email,
            password: password,
            full_name: full_name,
            phone: phone 
        });

      
        res.status(201).json({ 
            message: 'User registered successfully',
            userId: userId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// להסיר – מיועד למנוע גישה ב־GET
router.get('/login', (req, res) => {
    res.send('Login route is POST only. Use POST with JSON body.');
});

router.get('/register', (req, res) => {
    res.send('Register route is POST only. Use POST with JSON body.');
});

module.exports = router;
