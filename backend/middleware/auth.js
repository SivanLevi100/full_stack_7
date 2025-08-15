// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware לאותנטיקציה - בדיקת token
/*const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user; // שמירת פרטי המשתמש בבקשה
        next();
    });
};*/
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
        req.user = user;
        console.log('Token valid, user:', user);
        next();
    });
};

// Middleware לבדיקת הרשאות לפי תפקיד
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // בדיקה אם תפקיד המשתמש ברשימת התפקידים המותרים
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Access denied. Required roles: ${roles.join(', ')}` 
            });
        }

        next();
    };
};

// Middleware אופציונלי - לא חובה להיות מחובר
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