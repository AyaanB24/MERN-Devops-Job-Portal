import { fetchJobs, fetchJobById, createJob as apiCreateJob } from '../../services/jobApi';

// ─────────────────────────────────────────────────────────────────────────────
// Job Service — orchestration layer between jobSlice and jobApi.
// Builds query params from filter/pagination state before hitting the API.
// If query-building logic grows (sort, date range, etc.), only this file changes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches a paginated, filtered list of jobs.
 * Strips out empty/undefined filter values before sending to the API.
 *
 * @param {Object} filters - { keyword, location, jobType }
 * @param {number} page    - Current page number
 * @param {number} limit   - Results per page
 */
export const getJobs = async ({ filters = {}, page = 1, limit = 10 }) => {
  // Remove empty string filters — avoids sending ?keyword= to the backend
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );

  const params = { ...cleanFilters, page, limit };
  return fetchJobs(params);
};

/**
 * Fetches a single job by its MongoDB ObjectId.
 * @param {string} id
 */
export const getJobById = async (id) => {
  return fetchJobById(id);
};

export const createJob = async (jobData) => {
  return apiCreateJob(jobData);
};

