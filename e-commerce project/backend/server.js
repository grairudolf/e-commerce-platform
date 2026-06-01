require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const frontendPath = path.join(__dirname, '..', 'frontend');

app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.static(frontendPath, { index: false }));

app.use('/api/auth', require('./auth'));
app.use('/api/products', require('./products'));
app.use('/api/categories', require('./categories'));
app.use('/api/cart', require('./cart'));
app.use('/api/orders', require('./orders'));
app.use('/api/payments', require('./payments'));

app.get('/api', (req, res) => {
    res.json({ status: 'Trendora API is running', version: '1.0.0' });
});

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (err) {
        res.status(503).json({
            status: 'degraded',
            database: 'unavailable',
            error: err.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'home', 'home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'login', 'login.html'));
});

app.get('/cart', (req, res) => {
    res.sendFile(path.join(frontendPath, 'shop-card', 'card.html'));
});

app.get('/orders', (req, res) => {
    res.sendFile(path.join(frontendPath, 'order', 'order.html'));
});

app.get('/product', (req, res) => {
    res.sendFile(path.join(frontendPath, 'item-details', 'item.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
