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

    // 3. Generate JWT token for newly registered user
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'mySuperSecretKey',
      { expiresIn: '1d' }
    );

    // 4. Send response back to the client with token and user
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    // 5. Pass control to the global Express error handling middleware
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

/**
 * Handles HTTP requests for retrieving the authenticated user's profile.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user has already been populated by the protect middleware
    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

const userService = require('../services/userService');

/**
 * Handles HTTP requests for updating the authenticated user's profile.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles HTTP requests to get a candidate's profile by ID.
 * Used by recruiters to view candidate details.
 * 
 * @param {Object} req - Express request object with candidateId in params
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCandidateProfile = async (req, res, next) => {
  try {
    const { candidateId } = req.params;
    const User = require('../models/User');

    // Fetch candidate profile without password
    const candidate = await User.findById(candidateId).select('-password');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Candidate profile retrieved successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles resume file upload and saves the path to the user's profile.
 * 
 * @param {Object} req - Express request object with file attached by Multer
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a resume.',
      });
    }

    // Save resume path to user profile
    const User = require('../models/User');
    const resumePath = `/uploads/resumes/${req.file.filename}`;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { resume: resumePath } },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        filename: req.file.filename,
        path: resumePath,
        size: req.file.size,
        user: updatedUser
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getCandidateProfile,
  uploadResumeFile,
};

