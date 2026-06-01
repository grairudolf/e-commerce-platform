const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'trendora',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'trendora'
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        console.error('Start PostgreSQL and create the trendora database, then reload API requests.');
        return;
    }

    console.log('Connected to PostgreSQL - trendora');
    release();
});

module.exports = pool;
