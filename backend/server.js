/**
 * server.js
 * 
 * Entry point for the Express API server.
 * Responsibilities:
 *  - General server setup (CORS, JSON parsing)
 *  - Static file serving
 *  - Loading routers for all app modules (users, products, categories, orders, cart, orderItems, auth)
 *  - Handling 404 (Not Found) and 500 (Internal Server Error)
 *  - Starting the server on a defined port
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

/**
 * ==========================
 * Base Middleware
 * ==========================
 */

// Enable Cross-Origin requests
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (e.g., HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('Loading routers...');

/**
 * ==========================
 * Load Routers
 * ==========================
 */
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const categoriesRouter = require('./routes/categories');
const ordersRouter = require('./routes/orders');
const cartRouter = require('./routes/cart');
const orderItemsRouter = require('./routes/orderItems');

console.log('Setting up routes...');

/**
 * ==========================
 * Use Routers with Paths
 * ==========================
 */
app.use('/api/auth', authRouter);             // Auth: registration & login
app.use('/api/users', usersRouter);           // Users: CRUD & management
app.use('/api/products', productsRouter);     // Products: CRUD, stock, reports
app.use('/api/categories', categoriesRouter); // Categories: CRUD & reports
app.use('/api/orders', ordersRouter);         // Orders: CRUD, status, payment, totals
app.use('/api/cart', cartRouter);             // Cart: cart operations
app.use('/api/orderItems', orderItemsRouter); // OrderItems: CRUD & reports

/**
 * ==========================
 * Handle 404 - Not Found
 * ==========================
 */
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

/**
 * ==========================
 * Error Handling Middleware - 500
 * ==========================
 */
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

/**
 * ==========================
 * Start Server
 * ==========================
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
