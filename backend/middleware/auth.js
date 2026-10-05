const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'inctrl-development-secret-key-replace-in-production';

/**
 * Required authentication middleware.
 * Rejects requests with 401/403 if no valid token is provided.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access denied: Authentication token required'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired authentication token'
            });
        }
        req.user = decoded;
        next();
    });
}

/**
 * Optional authentication middleware.
 * If a valid token is provided, populates req.user.
 * If no token or invalid token, req.user remains null without failing the request.
 * Crucial for preventing IDOR when endpoints accept both authenticated users and guests.
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // Invalid token supplied
            req.user = null;
        } else {
            req.user = decoded;
        }
        next();
    });
}

/**
 * Role-based access control middleware.
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Forbidden: Admin access required'
        });
    }
    next();
}

function generateToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    generateToken,
    JWT_SECRET
};
