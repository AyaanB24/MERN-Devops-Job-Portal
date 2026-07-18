/**
 * OAuth Controller - Handles Google OAuth authentication
 * Manages Google token verification and user creation/login
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
let OAuth2Client;

try {
  const { OAuth2Client: GoogleAuth } = require('google-auth-library');
  OAuth2Client = GoogleAuth;
} catch (error) {
  console.warn('Google Auth Library not available. OAuth will be disabled.');
}

// Initialize Google OAuth2 Client (only if credentials exist)
const getOAuth2Client = () => {
  if (!OAuth2Client || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return null;
  }
  
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/oauth/google/callback'
  );
};

/**
 * Verify Google ID Token and handle user authentication
 * Called from frontend after Google login
 */
const verifyGoogleToken = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }

    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) {
      return res.status(503).json({
        success: false,
        message: 'OAuth service not configured'
      });
    }

    // Verify the token with Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    // Extract user info from Google token
    const { sub, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not found in Google account'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    let isNew = false;

    if (user) {
      // User exists - just verify they're logging in
      console.log(`User ${email} logging in via Google`);
    } else {
      // Create new user from Google info
      console.log(`Creating new user ${email} from Google`);
      isNew = true;
      
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        password: sub, // Store Google ID as password (won't be used for login)
        role: role || 'candidate', // Use provided role or default to candidate
        profilePhoto: picture || '',
        isGoogleAuth: true // Flag for OAuth user
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mySuperSecretKey',
      { expiresIn: '1d' }
    );

    // Return user and token with isNew flag
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      isNew: isNew,  // ← NEW: Flag to indicate if user was just created
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          createdAt: user.createdAt
        },
        token: token
      }
    });
  } catch (error) {
    console.error('OAuth verification error:', error);

    if (error.message.includes('Token used too early')) {
      return res.status(401).json({
        success: false,
        message: 'Token timing issue. Please try again.'
      });
    }

    if (error.message.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token'
      });
    }

    next(error);
  }
};

/**
 * Get Google OAuth consent screen URL
 * Frontend can redirect to this URL for user consent
 */
const getGoogleAuthUrl = (req, res) => {
  try {
    const { role } = req.query;

    if (!role || (role !== 'candidate' && role !== 'recruiter')) {
      return res.status(400).json({
        success: false,
        message: 'Valid role parameter required'
      });
    }

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      // Pass role as state to remember it after redirect
      state: role
    });

    return res.status(200).json({
      success: true,
      data: {
        authUrl: authUrl
      }
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate auth URL'
    });
  }
};

/**
 * Handle OAuth callback after user grants permission
 * Exchange authorization code for tokens
 */
const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code not provided'
      });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Set credentials
    oauth2Client.setCredentials(tokens);

    // Get user info
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email,
        role: state || 'candidate', // Use state as role
        profilePhoto: picture || '',
        isGoogleAuth: true
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mySuperSecretKey',
      { expiresIn: '1d' }
    );

    // Redirect to frontend with token
    // Frontend needs to handle this redirect
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/oauth-callback?token=${token}&userId=${user._id}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`;
    res.redirect(redirectUrl);
  }
};

module.exports = {
  verifyGoogleToken,
  getGoogleAuthUrl,
  handleGoogleCallback
};
