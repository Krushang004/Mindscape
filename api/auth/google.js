const jwt = require('jsonwebtoken');
const User = require('../../lib/models/User');
const { isMongoDBConfigured } = require('../../lib/mongodb');

// JWT secret for signing tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

/**
 * POST /auth/google
 * Handles Google Sign-in from the mobile app
 * 
 * Request body:
 * {
 *   "idToken": "firebase-id-token-from-google-signin"
 * }
 * 
 * Response:
 * {
 *   "token": "jwt-token-for-api-auth",
 *   "user": { ... user data ... }
 * }
 */
module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'method_not_allowed',
            message: 'Only POST requests are allowed'
        });
    }

    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                error: 'missing_id_token',
                message: 'idToken is required'
            });
        }

        // Verify Firebase ID token using Firebase Admin
        let decodedToken;
        try {
            const admin = require('firebase-admin');

            // Initialize Firebase Admin if not already done
            if (!admin.apps.length) {
                const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
                if (!serviceAccountKey) {
                    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY not configured');
                }

                const serviceAccount = JSON.parse(serviceAccountKey);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });
            }

            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (firebaseError) {
            console.error('Firebase token verification failed:', firebaseError.message);
            return res.status(401).json({
                error: 'invalid_token',
                message: 'Invalid Firebase ID token'
            });
        }

        const { uid, email, name, picture } = decodedToken;

        if (!email) {
            return res.status(400).json({
                error: 'missing_email',
                message: 'Email not found in token'
            });
        }

        // Create or update user in MongoDB (if configured)
        let user;
        if (isMongoDBConfigured()) {
            try {
                user = await User.findOrCreateFromGoogle({
                    firebaseUid: uid,
                    email: email,
                    displayName: name || email.split('@')[0],
                    photoURL: picture || null,
                });

                console.log('✅ User synced with MongoDB:', email);
            } catch (dbError) {
                console.error('❌ MongoDB error (non-critical):', dbError.message);
                // Continue without MongoDB - use Firebase data
                user = {
                    firebaseUid: uid,
                    email: email,
                    displayName: name || email.split('@')[0],
                    photoURL: picture || null,
                };
            }
        } else {
            // MongoDB not configured - use Firebase data only
            console.warn('⚠️  MongoDB not configured - user data not persisted');
            user = {
                firebaseUid: uid,
                email: email,
                displayName: name || email.split('@')[0],
                photoURL: picture || null,
            };
        }

        // Generate JWT token for API authentication
        const token = jwt.sign(
            {
                userId: user._id?.toString() || uid,
                email: user.email,
                firebaseUid: uid,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Return success response
        return res.status(200).json({
            success: true,
            token: token,
            user: {
                id: user._id?.toString() || uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                firebaseUid: user.firebaseUid,
            },
        });

    } catch (error) {
        console.error('❌ /auth/google error:', error);
        return res.status(500).json({
            error: 'server_error',
            message: error.message || 'Internal server error'
        });
    }
};
