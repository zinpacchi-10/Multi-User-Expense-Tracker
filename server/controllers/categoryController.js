const db = require('../config/db');

// Get all categories of logged-in user
exports.getCategories = (req, res) => {
    const userId = req.user.id;

    db.query(
        'SELECT * FROM categories WHERE user_id = $1 ORDER BY name',
        [userId],
        (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json(results.rows);
        }
    );
};

// Add new category
exports.addCategory = (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    db.query(
        'INSERT INTO categories (name, user_id) VALUES ($1, $2) RETURNING id',
        [name, userId],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to add category' });
            res.status(201).json({ message: 'Category added successfully', id: result.rows[0].id });
        }
    );
};

// Update category
exports.updateCategory = (req, res) => {
    const userId = req.user.id;
    const categoryId = req.params.id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
    }

    db.query(
        'UPDATE categories SET name = $1 WHERE id = $2 AND user_id = $3',
        [name, categoryId, userId],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to update category' });
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Category not found or not authorized' });
            }
            res.json({ message: 'Category updated successfully' });
        }
    );
};

// Delete category
exports.deleteCategory = (req, res) => {
    const userId = req.user.id;
    const categoryId = req.params.id;

    db.query(
        'DELETE FROM categories WHERE id = $1 AND user_id = $2',
        [categoryId, userId],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to delete category' });
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Category not found or not authorized' });
            }
            res.json({ message: 'Category deleted successfully' });
        }
    );
};