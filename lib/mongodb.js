const { MongoClient } = require('mongodb');

// MongoDB connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'mental-health-tracker';

if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set in environment variables');
    console.warn('   MongoDB features will be disabled until configured');
}

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB using connection pooling
 * Reuses existing connection in serverless environment
 */
async function connectToDatabase() {
    // Return cached connection if available
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
    }

    try {
        // Create new connection
        const client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
        });

        await client.connect();
        const db = client.db(DB_NAME);

        // Cache for reuse
        cachedClient = client;
        cachedDb = db;

        console.log('✅ Connected to MongoDB');
        return { client, db };
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
}

/**
 * Get database instance (connects if needed)
 */
async function getDb() {
    const { db } = await connectToDatabase();
    return db;
}

/**
 * Check if MongoDB is configured and available
 */
function isMongoDBConfigured() {
    return !!MONGODB_URI;
}

module.exports = {
    connectToDatabase,
    getDb,
    isMongoDBConfigured,
    DB_NAME,
};
