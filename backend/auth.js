const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const pool     = require('./db');
const { authLimiter, validateEmail, validatePhone } = require('./middleware');

// Apply auth rate limiter to all routes here
router.use(authLimiter);

// ─────────────────────────────────────────────
// POST /api/auth/register
// Creates a new customer account.
// Body: { first_name, last_name, email, phone_num, password }
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, phone_num, password } = req.body;

    if (!first_name || !last_name || !email || !phone_num || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Input validations (CIA Triad: Integrity)
    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address format.' });
    }

    if (!validatePhone(phone_num)) {
        return res.status(400).json({ error: 'Invalid phone number format. Must be 7-15 digits.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    try {
        // Check if email already exists
        const existing = await pool.query(
            'SELECT customer_id FROM customer WHERE email = $1',
            [email.toLowerCase().trim()]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email is already registered.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        // Insert new customer
        const result = await pool.query(
            `INSERT INTO customer (first_name, last_name, email, phone_num, password_hash)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING customer_id, first_name, last_name, email, created_at`,
            [
                first_name.trim(),
                last_name.trim(),
                email.toLowerCase().trim(),
                phone_num.trim(),
                password_hash
            ]
        );

        const newCustomer = result.rows[0];

        // Create empty cart for this customer
        await pool.query(
            'INSERT INTO carts (customer_id) VALUES ($1)',
            [newCustomer.customer_id]
        );

        // Sign JWT token
        const token = jwt.sign(
            { customer_id: newCustomer.customer_id, email: newCustomer.email },
            process.env.JWT_SECRET || 'supersecretjwtkey123!@#',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Account created successfully.',
            token,
            customer: {
                customer_id: newCustomer.customer_id,
                first_name: newCustomer.first_name,
                last_name: newCustomer.last_name,
                email: newCustomer.email
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// Logs in a customer by checking email + password.
// Body: { email, password }
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const result = await pool.query(
            `SELECT customer_id, first_name, last_name, email, password_hash
             FROM customer WHERE email = $1`,
            [email.toLowerCase().trim()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const customer = result.rows[0];

        const isMatch = await bcrypt.compare(password, customer.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Sign JWT token
        const token = jwt.sign(
            { customer_id: customer.customer_id, email: customer.email },
            process.env.JWT_SECRET || 'supersecretjwtkey123!@#',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful.',
            token,
            customer: {
                customer_id: customer.customer_id,
                first_name:  customer.first_name,
                last_name:   customer.last_name,
                email:       customer.email
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
