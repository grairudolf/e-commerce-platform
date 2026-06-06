const express = require('express');
const router  = express.Router();
const pool    = require('./db');
const { authenticateToken } = require('./middleware');

// Apply JWT verification to all cart routes
router.use(authenticateToken);

// ─────────────────────────────────────────────
// GET /api/cart/:customer_id
// Returns everything currently in a customer's cart.
// ─────────────────────────────────────────────
router.get('/:customer_id', async (req, res) => {
    // CIA Triad: Confidentiality
    if (req.user.customer_id !== req.params.customer_id) {
        return res.status(403).json({ error: 'Unauthorized access to cart.' });
    }

    try {
        const result = await pool.query(
            `SELECT
                ci.cart_item_id,
                ci.quantity,
                ci.added_at,
                pv.prod_var_id,
                pv.prod_size,
                pv.prod_color,
                pv.prod_price,
                pv.stock_quantity,
                p.prod_id,
                p.prod_name,
                v.vendor_name,
                (SELECT image_url FROM product_images
                 WHERE prod_id = p.prod_id LIMIT 1) AS image_url
             FROM carts ca
             JOIN cart_items ci    ON ci.cart_id      = ca.cart_id
             JOIN product_variants pv ON pv.prod_var_id = ci.prod_var_id
             JOIN product p        ON p.prod_id       = pv.prod_id
             JOIN vendor  v        ON v.vendor_id     = p.vendor_id
             WHERE ca.customer_id = $1`,
            [req.params.customer_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// POST /api/cart/add
// Adds a product variant to the customer's cart.
// If the variant is already in the cart, quantity increases.
// Body: { customer_id, prod_var_id, quantity }
// ─────────────────────────────────────────────
router.post('/add', async (req, res) => {
    const { customer_id, prod_var_id, quantity } = req.body;

    if (!customer_id || !prod_var_id || !quantity) {
        return res.status(400).json({ error: 'customer_id, prod_var_id, and quantity are required.' });
    }

    // CIA Triad: Integrity & Confidentiality
    if (req.user.customer_id !== customer_id) {
        return res.status(403).json({ error: 'Unauthorized to modify this cart.' });
    }

    const qtyVal = parseInt(quantity, 10);
    if (isNaN(qtyVal) || qtyVal < 1 || qtyVal > 10) {
        return res.status(400).json({ error: 'Quantity must be between 1 and 10.' });
    }

    try {
        const cartResult = await pool.query(
            'SELECT cart_id FROM carts WHERE customer_id = $1',
            [customer_id]
        );

        if (cartResult.rows.length === 0) {
            return res.status(404).json({ error: 'Cart not found for this customer.' });
        }

        const cart_id = cartResult.rows[0].cart_id;

        const stock = await pool.query(
            'SELECT stock_quantity FROM product_variants WHERE prod_var_id = $1',
            [prod_var_id]
        );

        if (stock.rows.length === 0) {
            return res.status(404).json({ error: 'Product variant not found.' });
        }

        if (stock.rows[0].stock_quantity < qtyVal) {
            return res.status(409).json({ error: 'Not enough stock available.' });
        }

        await pool.query(
            `INSERT INTO cart_items (cart_id, prod_var_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (cart_id, prod_var_id)
             DO UPDATE SET quantity = LEAST(10, cart_items.quantity + EXCLUDED.quantity)`,
            [cart_id, prod_var_id, qtyVal]
        );

        res.status(201).json({ message: 'Item added to cart.' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// PUT /api/cart/item/:cart_item_id
// Updates the quantity of a specific cart item.
// Body: { quantity }
// ─────────────────────────────────────────────
router.put('/item/:cart_item_id', async (req, res) => {
    const { quantity } = req.body;
    const qtyVal = parseInt(quantity, 10);

    if (isNaN(qtyVal) || qtyVal < 1 || qtyVal > 10) {
        return res.status(400).json({ error: 'Quantity must be between 1 and 10.' });
    }

    try {
        // CIA Triad: Integrity (verify cart item ownership)
        const ownerCheck = await pool.query(
            `SELECT ci.cart_item_id, pv.stock_quantity FROM cart_items ci
             JOIN carts c ON c.cart_id = ci.cart_id
             JOIN product_variants pv ON pv.prod_var_id = ci.prod_var_id
             WHERE ci.cart_item_id = $1 AND c.customer_id = $2`,
            [req.params.cart_item_id, req.user.customer_id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Unauthorized to update this cart item.' });
        }

        if (ownerCheck.rows[0].stock_quantity < qtyVal) {
            return res.status(409).json({ error: 'Not enough stock available.' });
        }

        const result = await pool.query(
            `UPDATE cart_items SET quantity = $1
             WHERE cart_item_id = $2
             RETURNING cart_item_id, quantity`,
            [qtyVal, req.params.cart_item_id]
        );

        res.json({ message: 'Quantity updated.', item: result.rows[0] });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/cart/item/:cart_item_id
// Removes one item from the cart.
// ─────────────────────────────────────────────
router.delete('/item/:cart_item_id', async (req, res) => {
    try {
        // CIA Triad: Integrity (verify cart item ownership)
        const ownerCheck = await pool.query(
            `SELECT ci.cart_item_id FROM cart_items ci
             JOIN carts c ON c.cart_id = ci.cart_id
             WHERE ci.cart_item_id = $1 AND c.customer_id = $2`,
            [req.params.cart_item_id, req.user.customer_id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Unauthorized to delete this cart item.' });
        }

        await pool.query(
            'DELETE FROM cart_items WHERE cart_item_id = $1',
            [req.params.cart_item_id]
        );

        res.json({ message: 'Item removed from cart.' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
