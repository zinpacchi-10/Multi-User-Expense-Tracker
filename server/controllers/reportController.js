const db = require('../config/db');

// Monthly Summary
exports.getMonthlySummary = (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query; // example: month=8&year=2026

    let sql = `
        SELECT 
            c.name AS category_name,
            SUM(e.amount) AS total_amount,
            COUNT(e.id) AS total_transactions
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ?
    `;
    const params = [userId];

    if (month && year) {
        sql += ` AND MONTH(e.date) = ? AND YEAR(e.date) = ?`;
        params.push(month, year);
    } else if (year) {
        sql += ` AND YEAR(e.date) = ?`;
        params.push(year);
    }

    sql += ` GROUP BY c.name ORDER BY total_amount DESC`;

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
};

// Total Spent (overall or by year/month)
exports.getTotalSpent = (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    let sql = `SELECT SUM(amount) AS total FROM expenses WHERE user_id = ?`;
    const params = [userId];

    if (month && year) {
        sql += ` AND MONTH(date) = ? AND YEAR(date) = ?`;
        params.push(month, year);
    } else if (year) {
        sql += ` AND YEAR(date) = ?`;
        params.push(year);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ total: results[0].total || 0 });
    });
};