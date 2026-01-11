const { Pool } = require('pg');
require('dotenv').config();

let pool;
let isMock = false;
const mockChats = []; // In-memory store

// Try to initialize PostgreSQL
try {
    if (process.env.DATABASE_URL) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('neon.tech') || process.env.DATABASE_URL.includes('supabase')
                ? { rejectUnauthorized: false }
                : false,
            // Timeout: 20s (Supabase free tier can be slow to wake up)
            connectionTimeoutMillis: 20000,
        });
    } else {
        console.warn('⚠️ No DATABASE_URL found. Using In-Memory Mock Database.');
        isMock = true;
    }
} catch (error) {
    console.warn('⚠️ Failed to configure Postgres pool. Using In-Memory Mock Database.');
    isMock = true;
}

// Initialize database tables
const initDb = async () => {
    if (isMock) return;

    try {
        const client = await pool.connect();

        await client.query(`
            CREATE TABLE IF NOT EXISTS chats (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                sender VARCHAR(50) NOT NULL, -- 'user' or 'ai'
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                personality VARCHAR(50),
                usage_days INT
            );
        `);

        console.log('✅ Connected to PostgreSQL Database');
        client.release();
    } catch (err) {
        console.error('⚠️ Could not connect to PostgreSQL:', err.message);
        console.log('🔄 Switching to In-Memory Mock Database for this session.');
        isMock = true;
    }
};

initDb();

module.exports = {
    query: async (text, params) => {
        // If already in mock mode, use it
        if (isMock) {
            return mockQuery(text, params);
        }

        try {
            return await pool.query(text, params);
        } catch (error) {
            console.warn('⚠️ Database weak signal (using fallback):', error.message);
            console.log('🔄 Switching to In-Memory Mock Database for this and future requests.');
            isMock = true;
            return mockQuery(text, params);
        }
    },
};

// Helper for Mock Queries
const mockQuery = (text, params) => {
    // Simple Mock Implementation for chats
    if (text.trim().includes('INSERT INTO chats')) {
        const [user_id, message, sender, personality, usage_days] = params;
        mockChats.push({
            id: mockChats.length + 1,
            user_id, message, sender, personality, usage_days,
            timestamp: new Date()
        });
        return { rows: [] };
    }
    if (text.trim().includes('SELECT * FROM chats')) {
        const userId = params[0];
        return { rows: mockChats.filter(c => c.user_id === userId) };
    }
    return { rows: [] };
};
