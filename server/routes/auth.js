const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
//Auth Route created to handle user registration and login requests. The router defines two POST endpoints: '/register' for user registration and '/login' for user authentication. Each endpoint is linked to the corresponding controller function in authController.js, which handles the logic for registering a new user and logging in an existing user, respectively.