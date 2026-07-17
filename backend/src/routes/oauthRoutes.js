const express = require('express');
const oauthController = require('../controllers/oauthController');

const router = express.Router();

/**
 * Route mapping for OAuth Authentication.
 * Base prefix is typically defined in app.js (e.g., /api/oauth)
 */

// POST /verify-google-token - Verify Google ID token and create/login user
// Frontend sends ID token from Google Sign-In library
router.post('/verify-google-token', oauthController.verifyGoogleToken);

// GET /google/auth-url - Get Google OAuth consent URL
// Frontend redirects user to this URL for consent
router.get('/google/auth-url', oauthController.getGoogleAuthUrl);

// GET /google/callback - Handle OAuth callback after user grants permission
// Google redirects here with authorization code
router.get('/google/callback', oauthController.handleGoogleCallback);

module.exports = router;
