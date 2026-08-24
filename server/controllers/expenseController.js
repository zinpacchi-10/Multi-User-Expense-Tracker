const db = require('../config/db');

// Get all expenses of logged-in user (with Filter + Search)
exports.getExpenses = (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, category_id, search } = req.query;

    let sql = `
        SELECT e.*, c.name AS category_name 
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ?
    `;
    const params = [userId];

    // Date range filter
    if (startDate) {
        sql += ` AND e.date >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        sql += ` AND e.date <= ?`;
        params.push(endDate);
    }

    // Category filter
    if (category_id) {
        sql += ` AND e.category_id = ?`;
        params.push(category_id);
    }

    // Search by description
    if (search) {
        sql += ` AND e.description LIKE ?`;
        params.push(`%${search}%`);
    }

    sql += ` ORDER BY e.date DESC`;

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
};

// Add new expense
exports.addExpense = (req, res) => {
    const userId = req.user.id;
    const { amount, description, date, category_id } = req.body;

    if (!amount || !date) {
        return res.status(400).json({ message: 'Amount and date are required' });
    }

    const sql = `INSERT INTO expenses (amount, description, date, category_id, user_id) VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [amount, description || null, date, category_id || null, userId], (err, result) => {
    if (err) {
        console.log('Add Expense Error:', err);   // ← এই লাইনটা যোগ করো
        return res.status(500).json({ message: 'Failed to add expense', error: err.message });
    }
    res.status(201).json({ message: 'Expense added successfully', id: result.insertId });
});
};

// Update expense
exports.updateExpense = (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const { amount, description, date, category_id } = req.body;

    const sql = `
        UPDATE expenses 
        SET amount = ?, description = ?, date = ?, category_id = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(sql, [amount, description, date, category_id, expenseId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to update expense' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }
        res.json({ message: 'Expense updated successfully' });
    });
};

// Delete expense
exports.deleteExpense = (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const sql = `DELETE FROM expenses WHERE id = ? AND user_id = ?`;

    db.query(sql, [expenseId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to delete expense' });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }
        res.json({ message: 'Expense deleted successfully' });
    });
};