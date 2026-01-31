const User = require('../../lib/models/User');
const { verifyToken } = require('../../lib/auth');

/**
 * GET/PUT /api/users/profile
 * Get or update user profile
 */
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verify authentication
    try {
        await new Promise((resolve, reject) => {
            verifyToken(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    } catch (authError) {
        return; // verifyToken already sent response
    }

    try {
        if (req.method === 'GET') {
            // Get user profile
            const user = await User.findById(req.user.userId);

            if (!user) {
                return res.status(404).json({
                    error: 'user_not_found',
                    message: 'User not found'
                });
            }

            return res.status(200).json({
                success: true,
                user: {
                    id: user._id.toString(),
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    settings: user.settings,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                },
            });

        } else if (req.method === 'PUT') {
            // Update user profile
            const updates = req.body;

            const updatedUser = await User.updateProfile(req.user.userId, updates);

            return res.status(200).json({
                success: true,
                user: {
                    id: updatedUser._id.toString(),
                    email: updatedUser.email,
                    displayName: updatedUser.displayName,
                    photoURL: updatedUser.photoURL,
                    settings: updatedUser.settings,
                },
            });

        } else {
            return res.status(405).json({
                error: 'method_not_allowed',
                message: 'Only GET and PUT requests are allowed'
            });
        }

    } catch (error) {
        console.error('❌ /api/users/profile error:', error);
        return res.status(500).json({
            error: 'server_error',
            message: error.message || 'Internal server error'
        });
    }
};
