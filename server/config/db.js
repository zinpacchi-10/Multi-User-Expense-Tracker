const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
    } else {
        console.log('PostgreSQL Database connected successfully');
    }
});

module.exports = pool;