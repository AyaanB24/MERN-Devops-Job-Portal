const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes by validating the JSON Web Token (JWT)
 * passed in the Authorization header as a Bearer token.
 * Requires a token to be present - returns 401 if missing or invalid.
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
      return next(error);
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

/**
 * Optional Authentication Middleware
 * Attempts to authenticate the user if a token is provided in the Authorization header.
 * If authentication succeeds, req.user is populated.
 * If no token is provided or authentication fails, the request proceeds without a user.
 * This allows routes to behave differently based on whether a user is authenticated.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const optionalAuth = async (req, res, next) => {
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
      req.user = await User.findById(decoded.id).select('-password');

      // If user exists, proceed with authentication
      if (req.user) {
        return next();
      }
    } catch (error) {
      // If token is invalid or verification fails, still proceed without a user
      // This allows public access to the route
    }
  }

  // Proceed without a user (either no token provided or token invalid)
  // The route handler can check req.user to determine behavior
  return next();
};

module.exports = {
  protect,
  optionalAuth,
};
