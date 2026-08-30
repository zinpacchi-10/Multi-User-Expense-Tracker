// Auth Controller
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register
exports.register = (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    db.query('SELECT * FROM users WHERE email = $1', [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        db.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword],
            (err, result) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: 'Registration failed' });
                }

                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    });
};

// Login
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.query('SELECT * FROM users WHERE email = $1', [email], async (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = results.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Create Token
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
};