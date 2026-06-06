const express = require('express');
const router  = express.Router();
const pool    = require('./db');
const { authenticateToken } = require('./middleware');

// Apply JWT verification to all payment routes
router.use(authenticateToken);

// ─────────────────────────────────────────────
// POST /api/payments
// Records a payment for an order.
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
    const {
        order_id,
        customer_id,
        payment_method,
        phone_number,
        amount,
        transaction_reference
    } = req.body;

    if (!order_id || !customer_id || !payment_method || !phone_number || !amount) {
        return res.status(400).json({ error: 'All payment fields are required.' });
    }

    // CIA Triad: Integrity & Confidentiality
    if (req.user.customer_id !== customer_id) {
        return res.status(403).json({ error: 'Unauthorized payment request.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Check if order exists and belongs to this customer
        const orderCheck = await client.query(
            'SELECT customer_id FROM orders WHERE order_id = $1',
            [order_id]
        );

        if (orderCheck.rows.length === 0 || orderCheck.rows[0].customer_id !== customer_id) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Order not found or unauthorized.' });
        }

        // Insert the payment record
        const payment = await client.query(
            `INSERT INTO payment
                (order_id, customer_id, payment_method, phone_number,
                 amount, transaction_reference, payment_status)
             VALUES ($1, $2, $3, $4, $5, $6, 'successful')
             RETURNING payment_id, payment_status, created_at`,
            [order_id, customer_id, payment_method, phone_number,
             amount, transaction_reference || 'TXN-' + Date.now()]
        );

        // Update the order's payment status
        await client.query(
            `UPDATE orders
             SET payment_status = 'successful',
                 order_status   = 'confirmed'
             WHERE order_id = $1`,
             [order_id]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Payment recorded successfully.',
            payment: payment.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// ─────────────────────────────────────────────
// GET /api/payments/order/:order_id
// Returns the payment record for a specific order.
// ─────────────────────────────────────────────
router.get('/order/:order_id', async (req, res) => {
    try {
        // CIA Triad: Confidentiality (check order owner first)
        const orderCheck = await pool.query(
            'SELECT customer_id FROM orders WHERE order_id = $1',
            [req.params.order_id]
        );

        if (orderCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }

        if (orderCheck.rows[0].customer_id !== req.user.customer_id) {
            return res.status(403).json({ error: 'Unauthorized to view this payment.' });
        }

        const result = await pool.query(
            `SELECT
                payment_id,
                payment_method,
                phone_number,
                amount,
                currency,
                payment_status,
                transaction_reference,
                created_at
             FROM payment
             WHERE order_id = $1`,
            [req.params.order_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No payment found for this order.' });
        }

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
