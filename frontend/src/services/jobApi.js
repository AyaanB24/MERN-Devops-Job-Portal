import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// Job API Service — Public endpoints, no auth token required.
// All functions return the full response.data so slices can destructure freely.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/jobs
 * Supports server-side pagination and keyword/location/jobType filtering.
 *
 * @param {Object} params
 * @param {number} params.page      - Page number (default 1)
 * @param {number} params.limit     - Results per page (default 10)
 * @param {string} params.keyword   - Search term matched against title/description
 * @param {string} params.location  - Filter by location string
 * @param {string} params.jobType   - 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote'
 *
 * @returns {{ success, data: Job[], pagination: { page, totalPages } }}
 */
export const fetchJobs = async (params = {}) => {
  const response = await apiClient.get('/jobs', { params });
  return response.data;
};

/**
 * GET /api/jobs/:id
 * Returns a single job with company (companyName, description, website) populated.
 *
 * @param {string} id - MongoDB ObjectId of the job
 * @returns {{ success, data: Job }}
 */
export const fetchJobById = async (id) => {
  const response = await apiClient.get(`/jobs/${id}`);
  return response.data;
};
