// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await User.findByUsername(username);
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

        res.json({ 
            message: 'Login successful', 
            user: userInfo 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Register
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, name, address } = req.body;
        
        if (!username || !password || !email || !name) {
            return res.status(400).json({ error: 'Username, password, email, and name are required' });
        }

        // Check if user already exists
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(409).json({ error: 'Username already exists' });
        }

        // Create user
        const userId = await User.create({
            name, username, email, address
        });

        // Create password
        await User.createPassword(userId, password);

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