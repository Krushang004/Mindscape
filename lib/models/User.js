const { getDb } = require('./mongodb');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'users';

/**
 * User Model
 * Handles all user-related database operations
 */
class User {
    /**
     * Find user by email
     */
    static async findByEmail(email) {
        try {
            const db = await getDb();
            const user = await db.collection(COLLECTION_NAME).findOne({ email: email.toLowerCase() });
            return user;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    /**
     * Find user by ID
     */
    static async findById(userId) {
        try {
            const db = await getDb();
            const user = await db.collection(COLLECTION_NAME).findOne({
                _id: new ObjectId(userId)
            });
            return user;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    /**
     * Find user by Firebase UID
     */
    static async findByFirebaseUid(firebaseUid) {
        try {
            const db = await getDb();
            const user = await db.collection(COLLECTION_NAME).findOne({ firebaseUid });
            return user;
        } catch (error) {
            console.error('Error finding user by Firebase UID:', error);
            throw error;
        }
    }

    /**
     * Create or update user from Google OAuth
     * Returns the user document
     */
    static async findOrCreateFromGoogle({ firebaseUid, email, displayName, photoURL }) {
        try {
            const db = await getDb();
            const now = new Date();

            // Try to find existing user by Firebase UID or email
            let user = await this.findByFirebaseUid(firebaseUid);

            if (!user) {
                user = await this.findByEmail(email);
            }

            if (user) {
                // Update existing user
                const updateData = {
                    lastLogin: now,
                    firebaseUid, // Update in case it changed
                };

                // Update display name and photo if provided
                if (displayName) updateData.displayName = displayName;
                if (photoURL) updateData.photoURL = photoURL;

                await db.collection(COLLECTION_NAME).updateOne(
                    { _id: user._id },
                    { $set: updateData }
                );

                return { ...user, ...updateData };
            } else {
                // Create new user
                const newUser = {
                    firebaseUid,
                    email: email.toLowerCase(),
                    displayName: displayName || email.split('@')[0],
                    photoURL: photoURL || null,
                    authProvider: 'google',
                    createdAt: now,
                    lastLogin: now,
                    settings: {
                        notifications: true,
                        theme: 'light',
                    },
                };

                const result = await db.collection(COLLECTION_NAME).insertOne(newUser);
                return { ...newUser, _id: result.insertedId };
            }
        } catch (error) {
            console.error('Error in findOrCreateFromGoogle:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId, updates) {
        try {
            const db = await getDb();

            // Filter allowed fields
            const allowedFields = ['displayName', 'photoURL', 'settings'];
            const filteredUpdates = {};

            allowedFields.forEach(field => {
                if (updates[field] !== undefined) {
                    filteredUpdates[field] = updates[field];
                }
            });

            if (Object.keys(filteredUpdates).length === 0) {
                throw new Error('No valid fields to update');
            }

            filteredUpdates.updatedAt = new Date();

            const result = await db.collection(COLLECTION_NAME).updateOne(
                { _id: new ObjectId(userId) },
                { $set: filteredUpdates }
            );

            if (result.matchedCount === 0) {
                throw new Error('User not found');
            }

            return await this.findById(userId);
        } catch (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    }

    /**
     * Delete user (for GDPR compliance)
     */
    static async deleteUser(userId) {
        try {
            const db = await getDb();
            const result = await db.collection(COLLECTION_NAME).deleteOne({
                _id: new ObjectId(userId)
            });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

module.exports = User;
