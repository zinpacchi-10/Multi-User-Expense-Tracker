const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
});
// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
// Expense routes
const expenseRoutes = require('./routes/expenses');
app.use('/api/expenses', expenseRoutes);
// Category routes
const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);

module.exports = app;