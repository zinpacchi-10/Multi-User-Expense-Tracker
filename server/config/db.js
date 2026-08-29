const mysql = require('mysql2');
require('dotenv').config();

let db;

if (process.env.MYSQL_URL) {
    db = mysql.createConnection(process.env.MYSQL_URL);
} else {
    db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });
}

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err.message);
    } else {
        console.log('MySQL Database connected successfully');
    }
});

module.exports = db;