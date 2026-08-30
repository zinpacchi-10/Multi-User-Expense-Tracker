const db = require('../config/db');

// Get all expenses of logged-in user (with Filter + Search)
exports.getExpenses = (req, res) => {
    const userId = req.user.id;
    const { startDate, endDate, category_id, search } = req.query;

    let sql = `
        SELECT e.*, c.name AS category_name 
        FROM expenses e
        LEFT JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    // Date range filter
    if (startDate) {
        sql += ` AND e.date >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
    }
    if (endDate) {
        sql += ` AND e.date <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
    }

    // Category filter
    if (category_id) {
        sql += ` AND e.category_id = $${paramIndex}`;
        params.push(category_id);
        paramIndex++;
    }

    // Search by description
    if (search) {
        sql += ` AND e.description ILIKE $${paramIndex}`;
        params.push(`%${search}%`);
        paramIndex++;
    }

    sql += ` ORDER BY e.date DESC`;

    db.query(sql, params, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.json(results.rows);
    });
};

// Add Expense
exports.addExpense = (req, res) => {
    const userId = req.user.id;
    const { amount, description, date, category_id } = req.body;

    if (amount === undefined || amount === null || amount === '') {
        return res.status(400).json({ message: 'Amount is required' });
    }

    if (isNaN(amount)) {
        return res.status(400).json({ message: 'Amount must be a number' });
    }

    if (!date) {
        return res.status(400).json({ message: 'Date is required' });
    }

    const sql = `
        INSERT INTO expenses (amount, description, date, category_id, user_id) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id
    `;

    db.query(sql, [amount, description || null, date, category_id || null, userId], (err, result) => {
        if (err) {
            console.log('Add Expense Error:', err);
            return res.status(500).json({ message: 'Failed to add expense', error: err.message });
        }
        res.status(201).json({ message: 'Expense added successfully', id: result.rows[0].id });
    });
};

// Update expense
exports.updateExpense = (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const { amount, description, date, category_id } = req.body;

    const sql = `
        UPDATE expenses 
        SET amount = $1, description = $2, date = $3, category_id = $4
        WHERE id = $5 AND user_id = $6
    `;

    db.query(sql, [amount, description, date, category_id, expenseId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to update expense' });
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }
        res.json({ message: 'Expense updated successfully' });
    });
};

// Delete expense
exports.deleteExpense = (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const sql = `DELETE FROM expenses WHERE id = $1 AND user_id = $2`;

    db.query(sql, [expenseId, userId], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to delete expense' });
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Expense not found or not authorized' });
        }
        res.json({ message: 'Expense deleted successfully' });
    });
};