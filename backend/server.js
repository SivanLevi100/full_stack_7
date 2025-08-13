const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('Loading routers...');

const authRouter = require('./routes/auth');
console.log('Auth loaded, type:', typeof authRouter);

const usersRouter = require('./routes/users');
console.log('Users loaded, type:', typeof usersRouter);

const productsRouter = require('./routes/products');
console.log('Products loaded, type:', typeof productsRouter);

const categoriesRouter = require('./routes/categories');
console.log('Categories loaded, type:', typeof categoriesRouter);

const ordersRouter = require('./routes/orders');
console.log('Orders loaded, type:', typeof ordersRouter);

const cartRouter = require('./routes/cart');
console.log('Cart loaded, type:', typeof cartRouter);

console.log('Setting up routes...');

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/cart', cartRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
