const { Pool } = require('pg');
require('dotenv').config();

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
    } else {
        console.log('PostgreSQL Database connected successfully');
    }
});

module.exports = pool;