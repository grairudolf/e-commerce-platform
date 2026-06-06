const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token is required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123!@#', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
}

// Input validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function validatePhone(phone) {
    // Basic phone validation: allows + and digits, 7-15 chars
    const re = /^\+?[0-9]{7,15}$/;
    return re.test(String(phone));
}

// Rate limiting configurations
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 requests per window (login/register)
    message: { error: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const checkoutLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 order creations per minute (prevents checkout bots)
    message: { error: 'Too many checkout attempts. Please try again after a minute.' }
});

const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // General rate limit
    message: { error: 'Too many requests. Please try again later.' }
});

module.exports = {
    authenticateToken,
    validateEmail,
    validatePhone,
    authLimiter,
    checkoutLimiter,
    apiLimiter
};
