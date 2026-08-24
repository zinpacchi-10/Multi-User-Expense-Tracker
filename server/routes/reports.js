const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/monthly-summary', reportController.getMonthlySummary);
router.get('/total', reportController.getTotalSpent);

module.exports = router;