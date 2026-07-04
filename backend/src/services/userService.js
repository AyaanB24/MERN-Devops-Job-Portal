const User = require('../models/User');

/**
 * Updates the candidate's profile with personal, educational, and professional details.
 * Performs validation, filters out unauthorized updates (e.g., password, role, email changes),
 * and retrieves the updated user excluding sensitive fields.
 *
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @param {Object} updatePayload - The profile fields to update.
 * @returns {Promise<Object>} The updated and sanitized user document.
 * @throws {Error} If the user is not found or validation fails.
 */
const updateProfile = async (userId, updatePayload) => {
  // 1. Strict whitelist of fields that candidates are allowed to update
  const allowedFields = [
    'bio',
    'skills',
    'profilePhoto',
    'education',
    'keySkills',
    'languages',
    'internships',
    'projects',
    'profileSummary',
    'accomplishments',
    'academicAchievements',
    'resume',
  ];

  // 2. Filter input payload to discard any unauthorized fields (e.g., password, email, role)
  const updates = {};
  for (const field of allowedFields) {
    if (updatePayload[field] !== undefined) {
      updates[field] = updatePayload[field];
    }
  }

  // 3. Update the database document
  // { returnDocument: 'after' } returns the modified document rather than the original (replaces deprecated 'new: true')
  // { runValidators: true } runs schema-defined validations on the updated fields
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { returnDocument: 'after', runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return updatedUser;
};

module.exports = {
  updateProfile,
};
