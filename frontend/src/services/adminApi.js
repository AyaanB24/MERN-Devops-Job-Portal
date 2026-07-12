import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// Admin API — Handles Admin operations
// ─────────────────────────────────────────────────────────────────────────────

export const getAnalytics = async () => {
  const response = await apiClient.get('/admin/analytics');
  return response.data;
};

export const getUsers = async (page = 1, limit = 10) => {
  const response = await apiClient.get('/admin/users', { params: { page, limit } });
  return response.data; // { success, data, pagination }
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/admin/users/${id}`);
  return response.data;
};

// Reusing job deletion endpoint from the job controller
export const deleteJobAsAdmin = async (id) => {
  const response = await apiClient.delete(`/jobs/${id}`);
  return response.data;
};
