const User = require('../models/User');

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

module.exports = {
  registerUser,
};
