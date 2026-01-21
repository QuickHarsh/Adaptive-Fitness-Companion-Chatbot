const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');
const aiService = require('./aiService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Adaptive Fitness Chatbot Backend is running');
});

// Chat API
app.get('/api/history', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM chats ORDER BY id DESC LIMIT 20');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, userId, userContext } = req.body;

        if (!message || !userId) {
            return res.status(400).json({ error: 'Message and UserId are required' });
        }

        await db.query(
            'INSERT INTO chats (user_id, message, sender, personality, usage_days) VALUES ($1, $2, $3, $4, $5)',
            [userId, message, 'user', userContext?.personality, userContext?.usageDays]
        );

        // 2. Get AI Response
        const aiResponse = await aiService.generateResponse(message, userContext);

        // If the response is structured (JSON), we might want to store it as string
        const aiMessageContent = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);

        await db.query(
            'INSERT INTO chats (user_id, message, sender, personality, usage_days) VALUES ($1, $2, $3, $4, $5)',
            [userId, aiMessageContent, 'ai', userContext?.personality, userContext?.usageDays]
        );

        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error in chat API:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.get('/api/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await db.query(
            'SELECT * FROM chats WHERE user_id = $1 ORDER BY timestamp ASC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
