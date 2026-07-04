const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * Route mapping for User Authentication.
 * Base prefix is typically defined in app.js (e.g., /api/auth)
 */

// POST /register - Handles new user signup
router.post('/register', authController.register);

// POST /login - Handles existing user signin
router.post('/login', authController.login);

// GET /profile - Retrieves authenticated user profile
router.get('/profile', protect, authController.getProfile);

// GET /admin-only - Test route for Admin role only
router.get('/admin-only', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Welcome Admin!',
  });
});

// GET /recruiter-only - Test route for Recruiter role only
router.get('/recruiter-only', protect, authorize('recruiter'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted: Welcome Recruiter!',
  });
});

module.exports = router;


