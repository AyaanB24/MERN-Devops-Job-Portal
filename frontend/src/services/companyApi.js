import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────────────────────
// Company API — Handles Recruiter company operations
// ─────────────────────────────────────────────────────────────────────────────

export const createCompany = async (companyData) => {
  const response = await apiClient.post('/companies', companyData);
  return response.data;
};

export const getMyCompanies = async () => {
  const response = await apiClient.get('/companies');
  return response.data; // Note: In this MVP, a recruiter manages one primary company
};

export const updateCompany = async (id, companyData) => {
  const response = await apiClient.put(`/companies/${id}`, companyData);
  return response.data;
};
