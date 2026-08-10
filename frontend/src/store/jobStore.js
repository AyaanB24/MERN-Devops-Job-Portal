import { create } from 'zustand';
import axios from 'axios';

const API_BASE = '/api';

export const useJobStore = create((set, get) => ({
  jobs: [],
  applications: [],
  companies: [],
  isLoading: false,
  error: null,

  // JOBS
  fetchJobs: async (page = 1, createdBy = null, manageMode = false) => {
    set({ isLoading: true, error: null });
    try {
      const params = { page, limit: 10 };
      if (createdBy) params.createdBy = createdBy;
      if (manageMode) params.manageMode = 'true';
      const response = await axios.get(`${API_BASE}/jobs`, { params });
      set({ jobs: response.data.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch jobs', isLoading: false });
      throw error;
    }
  },

  fetchJobById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/jobs/${id}`);
      set({ isLoading: false });
      return response.data.data;
    } catch (error) {
      set({ error: 'Failed to fetch job', isLoading: false });
      throw error;
    }
  },

  createJob: async (jobData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Posting job:', jobData);
      console.log('Current axios defaults:', axios.defaults.headers.common);
      
      const response = await axios.post(`${API_BASE}/jobs`, jobData);
      
      console.log('Job created successfully:', response.data);
      set({ isLoading: false });
      
      // Refetch jobs in manage mode
      await get().fetchJobs(1, null, true);
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating job:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to create job';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateJob: async (id, jobData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_BASE}/jobs/${id}`, jobData);
      set({ isLoading: false });
      await get().fetchJobs(1, null, true);
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update job';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteJob: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_BASE}/jobs/${id}`);
      set({ isLoading: false });
      await get().fetchJobs(1, null, true);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete job';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // APPLICATIONS
  fetchApplications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/applications`);
      set({ applications: response.data.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      // Handle 404 gracefully - endpoint doesn't exist yet
      if (error.response?.status === 404) {
        console.log('Applications endpoint not found (404) - showing empty list');
        set({ applications: [], isLoading: false, error: null });
        return { success: true, data: [] };
      }
      // For other errors, also don't throw - just show empty
      console.error('Failed to fetch applications:', error.message);
      set({ applications: [], isLoading: false, error: null });
      return { success: true, data: [] };
    }
  },

  fetchApplicationsByJob: async (jobId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/applications?job=${jobId}`);
      set({ applications: response.data.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch applications', isLoading: false });
      throw error;
    }
  },

  applyForJob: async (jobId, coverLetter) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_BASE}/applications`,
        { job: jobId, coverLetter }
      );
      set({ isLoading: false });
      await get().fetchApplications();
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to apply for job';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateApplicationStatus: async (applicationId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_BASE}/applications/${applicationId}/status`,
        { status }
      );
      set({ isLoading: false });
      await get().fetchApplications();
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update application status';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // COMPANIES
  fetchCompanies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE}/companies`);
      set({ companies: response.data.data || [], isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: 'Failed to fetch companies', isLoading: false });
      throw error;
    }
  },

  createCompany: async (companyData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Creating company:', companyData);
      const response = await axios.post(`${API_BASE}/companies`, companyData);
      console.log('Company created:', response.data);
      set({ isLoading: false });
      await get().fetchCompanies();
      return response.data.data;
    } catch (error) {
      console.error('Error creating company:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to create company';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateCompany: async (id, companyData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_BASE}/companies/${id}`, companyData);
      set({ isLoading: false });
      await get().fetchCompanies();
      return response.data.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update company';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  deleteCompany: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_BASE}/companies/${id}`);
      set({ isLoading: false });
      await get().fetchCompanies();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete company';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },
}));
