const db = require('../config/db');

// Monthly Summary
exports.getMonthlySummary = (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    let sql = `
        SELECT 
            c.name AS category_name,
            SUM(e.amount) AS total_amount,
            COUNT(e.id) AS total_transactions
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (month && year) {
        sql += ` AND EXTRACT(MONTH FROM e.date) = $${paramIndex} AND EXTRACT(YEAR FROM e.date) = $${paramIndex + 1}`;
        params.push(month, year);
        paramIndex += 2;
    } else if (year) {
        sql += ` AND EXTRACT(YEAR FROM e.date) = $${paramIndex}`;
        params.push(year);
        paramIndex++;
    }

    sql += ` GROUP BY c.name ORDER BY total_amount DESC`;

    db.query(sql, params, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results.rows);
    });
};

// Total Spent (overall or by year/month)
exports.getTotalSpent = (req, res) => {
    const userId = req.user.id;
    const { month, year } = req.query;

    let sql = `SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id = $1`;
    const params = [userId];
    let paramIndex = 2;

    if (month && year) {
        sql += ` AND EXTRACT(MONTH FROM date) = $${paramIndex} AND EXTRACT(YEAR FROM date) = $${paramIndex + 1}`;
        params.push(month, year);
    } else if (year) {
        sql += ` AND EXTRACT(YEAR FROM date) = $${paramIndex}`;
        params.push(year);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json({ total: results.rows[0].total || 0 });
    });
};