import apiClient from './apiClient';

/**
 * POST /api/applications
 * Applies to a job listing with an optional cover letter.
 * 
 * @param {Object} payload - { job: string, coverLetter?: string }
 * @returns {Promise<Object>} - { success, data: Application }
 */
export const applyToJob = async (payload) => {
  const response = await apiClient.post('/applications', payload);
  return response.data;
};

/**
 * GET /api/applications
 * Fetches applications. Candidates get their own applied jobs. Recruiters fetch by job.
 * 
 * @param {Object} params - Optional search query filters (e.g. { job: string })
 * @returns {Promise<Object>} - { success, data: Application[] }
 */
export const fetchApplications = async (params = {}) => {
  const response = await apiClient.get('/applications', { params });
  return response.data;
};
