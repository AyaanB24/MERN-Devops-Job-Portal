const authService = require('../services/authService');

/**
 * Handles HTTP requests for registering a new user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic payload validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields',
      });
    }

    // 2. Delegate to the service layer for business logic validation & execution
    const user = await authService.registerUser(req.body);

    // 3. Send response back to the client
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    // 4. Pass control to the global Express error handling middleware
    next(error);
  }
};

/**
 * Handles HTTP requests for logging in an existing user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Basic payload validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required fields',
      });
    }

    // 2. Delegate to the service layer for authentication
    const { user, token } = await authService.loginUser(email, password);

    // 3. Send response back to the client
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // 4. Pass control to the global Express error handling middleware
    next(error);
  }
};

module.exports = {
  register,
  login,
};
