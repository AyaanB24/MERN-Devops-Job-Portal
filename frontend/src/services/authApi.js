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
