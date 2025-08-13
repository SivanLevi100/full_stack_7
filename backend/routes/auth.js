// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');



// Login
router.post('/login', async (req, res) => {
    try {
        console.log('🔑 Login request body:', req.body);
        
        const { username, password } = req.body;
        
        console.log('🔍 Login fields:');
        console.log('username:', username);
        console.log('password:', password);
        
        if (!username || !password) {
            console.log('❌ Missing login fields');
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findByEmail(username);
        console.log('👤 Found user:', user ? 'YES' : 'NO');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isValidPassword = await User.verifyPassword(user.id, password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Remove sensitive information
        const { id, name, username1, email, address } = user;
        const userInfo = { id, name, username1, email, address };

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
// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, name, address } = req.body;
        
        if (!username || !password || !email || !name) {
            return res.status(400).json({ error: 'Username, password, email, and name are required' });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);  // שני מusername לemail
        if (existingUser) {
            return res.status(409).json({ error: 'Email already exists' });
        }

        // Create user - הוסף password!
        const userId = await User.create({
            email: email,
            password: password,      // ← הוסף את זה!
            full_name: name,
            phone: address
        });

        // הסר את השורה הזו - User.createPassword לא קיים!
        // await User.createPassword(userId, password);

        res.status(201).json({ 
            message: 'User registered successfully',
            userId: userId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//להסיר
router.get('/login', (req, res) => {
  res.send('Login route is POST only. Use POST with JSON body.');
});
//להסיר
router.get('/register', (req, res) => {
  res.send('Register route is POST only. Use POST with JSON body.');
});


module.exports = router;