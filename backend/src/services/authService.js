const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Registers a new user in the system.
 * 
 * @param {Object} userData - Payload containing user details from the request body.
 * @returns {Promise<Object>} - The saved user document (excluding password).
 * @throws {Error} - If the email is already in use or validation fails.
 */
const registerUser = async (userData) => {
  const { name, email, password, role, profilePhoto, resume, skills, bio } = userData;

  // 1. Check for duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400; // Attach an HTTP status code for the global error handler
    throw error;
  }

  // 2. Create and Save the User
  // NOTE: Password hashing is handled automatically by the pre-save middleware 
  // defined in models/User.js using bcryptjs. This maintains encapsulation and ensures 
  // password hashing is never bypassed (e.g., during future password updates).
  const user = new User({
    name,
    email,
    password,
    role,
    profilePhoto,
    resume,
    skills,
    bio,
  });

  await user.save();

  // 3. Return sanitized user data (exclude password)
  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return sanitizedUser;
};

/**
 * Authenticates a user with email and password.
 * 
 * @param {string} email - User's email.
 * @param {string} password - User's plain password.
 * @returns {Promise<Object>} - Object containing sanitized user details and JWT token.
 * @throws {Error} - If user is not found, password is incorrect, or validation fails.
 */
const loginUser = async (email, password) => {
  // 1. Find user by email (explicitly select password as it has select: false in schema)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 2. Compare entered password with hashed password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // 3. Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'mySuperSecretKey',
    { expiresIn: '1d' }
  );

  // 4. Return safe user data (exclude password)
  const sanitizedUser = user.toObject();
  delete sanitizedUser.password;

  return {
    user: sanitizedUser,
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
