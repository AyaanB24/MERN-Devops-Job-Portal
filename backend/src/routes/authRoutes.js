const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * Route mapping for User Authentication.
 * Base prefix is typically defined in app.js (e.g., /api/auth)
 */

// POST /register - Handles new user signup
router.post('/register', authController.register);

// POST /login - Handles existing user signin
router.post('/login', authController.login);

module.exports = router;
