require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./connectionMySQL');

const quizRoutes = require('./routes/quizRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const shortcutRoutes = require('./routes/shortcutRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err, rows) => {
        if (err) {
            return res.status(500).json({
                status: 'unhealthy',
                database: 'disconnected',
                error: err.message
            });
        }
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    });
});

// Application API routes
app.use(quizRoutes);
app.use(categoryRoutes);
app.use(shortcutRoutes);
app.use(userRoutes);

// 404 handler for unknown API routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Endpoint '${req.originalUrl}' not found`
    });
});

// Start Server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`🚀 inCTRL Backend Server running at http://localhost:${port}`);
        console.log(`👉 API Health check: http://localhost:${port}/api/health`);
        console.log(`👉 Quiz Questions: http://localhost:${port}/api/questions`);
        console.log(`👉 Shortcuts: http://localhost:${port}/api/shortcuts`);
        console.log(`👉 Users: http://localhost:${port}/api/users`);
    });
}

module.exports = app;