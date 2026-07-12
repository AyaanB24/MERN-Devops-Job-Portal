import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// Auth API Service
// Pure async functions — no Redux logic, no side effects.
// Each function maps 1-to-1 with a backend auth route.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * @param {Object} userData - { name, email, password, role }
 * @returns {Object} - { token, user }
 */
export const registerUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

/**
 * POST /api/auth/login
 * @param {Object} credentials - { email, password }
 * @returns {Object} - { token, user }
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

/**
 * GET /api/auth/profile
 * Token is injected automatically by the apiClient request interceptor.
 * Used on app load to hydrate user state from a persisted token.
 * @returns {Object} - { user }
 */
export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

/**
 * PUT /api/auth/profile
 * Updates authenticated user profile details (bio, skills, etc.)
 * @param {Object} profileData
 * @returns {Object} - { success, data: User }
 */
export const updateUserProfile = async (profileData) => {
  const response = await apiClient.put('/auth/profile', profileData);
  return response.data;
};

/**
 * POST /api/auth/profile/resume
 * Uploads user resume PDF file (multipart form data)
 * @param {FormData} formData
 * @returns {Object} - { success, message, file: { filename, path, size } }
 */
export const uploadUserResume = async (formData) => {
  const response = await apiClient.post('/auth/profile/resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
