const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token from Authorization header
 * Adds decoded user data to req.user
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Missing or invalid authorization header'
        });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Add user data to request
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'token_expired',
                message: 'Token has expired'
            });
        }
        return res.status(401).json({
            error: 'invalid_token',
            message: 'Invalid token'
        });
    }
}

module.exports = { verifyToken, JWT_SECRET };
