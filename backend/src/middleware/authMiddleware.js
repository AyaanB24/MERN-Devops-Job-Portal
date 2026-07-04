const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes by validating the JSON Web Token (JWT)
 * passed in the Authorization header as a Bearer token.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check for Bearer token in authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header ("Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mySuperSecretKey');

      // 3. Fetch user from database and attach to req.user (excluding password)
      // The decoded payload contains the user's ID as defined during token signing
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      // 4. Proceed to the next middleware or controller
      return next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  // If no token is provided in the header
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = {
  protect,
};
