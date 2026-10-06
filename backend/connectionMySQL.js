const mysql = require('mysql2');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'inctrl_db',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Verify connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('⚠️ [MySQL] Connection failed:', err.message);
        console.error('👉 Make sure the Docker container is running: docker compose up -d');
    } else {
        console.log(`✅ [MySQL] Successfully connected to database "${dbConfig.database}" at ${dbConfig.host}:${dbConfig.port}`);
        connection.release();
    }
});

module.exports = pool;
