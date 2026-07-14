const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const uploadResume = require('../middleware/uploadMiddleware');
const { validateRegister, validateLogin } = require('../validators/authValidator');

const router = express.Router();

/**
 * Route mapping for User Authentication.
 * Base prefix is typically defined in app.js (e.g., /api/auth)
 */

// POST /register - Handles new user signup
router.post('/register', validateRegister, authController.register);

// POST /login - Handles existing user signin
router.post('/login', validateLogin, authController.login);

// GET /profile - Retrieves authenticated user profile
router.get('/profile', protect, authController.getProfile);

// PUT /profile - Updates authenticated user profile
router.put('/profile', protect, authController.updateProfile);

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

// POST /profile/resume - Handles resume PDF upload
router.post('/profile/resume', protect, (req, res) => {
  // Wrap in a custom callback to intercept and format Multer validation errors
  uploadResume.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a PDF resume.',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      file: {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
      },
    });
  });
});

module.exports = router;



