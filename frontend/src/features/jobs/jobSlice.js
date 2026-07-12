import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobs, getJobById } from './jobService';

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches paginated + filtered job list.
 * Payload: { filters, page, limit }
 */
export const fetchJobsList = createAsyncThunk(
  'jobs/fetchJobsList',
  async ({ filters, page, limit } = {}, { getState, rejectWithValue }) => {
    try {
      // Read current filters from state if not explicitly passed
      const currentFilters = filters ?? getState().jobs.filters;
      const currentPage = page ?? getState().jobs.pagination.currentPage;
      return await getJobs({ filters: currentFilters, page: currentPage, limit });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

/**
 * Fetches a single job by ID for the detail page.
 */
export const fetchJobDetail = createAsyncThunk(
  'jobs/fetchJobDetail',
  async (id, { rejectWithValue }) => {
    try {
      return await getJobById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Job not found');
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// Matches backend response shape exactly:
//   GET /api/jobs → { data: Job[], pagination: { page, totalPages } }
//   GET /api/jobs/:id → { data: Job }
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  // Job list
  jobs: [],
  listStatus: 'idle',   // 'idle' | 'loading' | 'succeeded' | 'failed'
  listError: null,

  // Job detail
  currentJob: null,
  detailStatus: 'idle',
  detailError: null,

  // Filters — stored in Redux so navigating back restores search state
  filters: {
    keyword: '',
    location: '',
    jobType: '',
  },

  // Pagination — mirrors backend { page, totalPages }
  pagination: {
    currentPage: 1,
    totalPages: 1,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────
const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    // Update a single filter field and reset to page 1
    setFilter(state, action) {
      const { key, value } = action.payload; // { key: 'keyword', value: 'react' }
      state.filters[key] = value;
      state.pagination.currentPage = 1;
    },
    // Reset all filters and pagination
    clearFilters(state) {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
    // Navigate to a specific page
    setPage(state, action) {
      state.pagination.currentPage = action.payload;
    },
    // Clear detail when leaving the detail page to avoid stale data flash
    clearCurrentJob(state) {
      state.currentJob = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Job List ────────────────────────────────────────────────────
    builder
      .addCase(fetchJobsList.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchJobsList.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.jobs = action.payload.data;
        state.pagination.currentPage = action.payload.pagination.page;
        state.pagination.totalPages = action.payload.pagination.totalPages;
      })
      .addCase(fetchJobsList.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload;
      });

    // ── Fetch Job Detail ──────────────────────────────────────────────────
    builder
      .addCase(fetchJobDetail.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
        state.currentJob = null;
      })
      .addCase(fetchJobDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.currentJob = action.payload.data;
      })
      .addCase(fetchJobDetail.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload;
      });
  },
});

export const { setFilter, clearFilters, setPage, clearCurrentJob } = jobSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────────────────────
export const selectJobs = (state) => state.jobs.jobs;
export const selectJobListStatus = (state) => state.jobs.listStatus;
export const selectJobListError = (state) => state.jobs.listError;
export const selectCurrentJob = (state) => state.jobs.currentJob;
export const selectJobDetailStatus = (state) => state.jobs.detailStatus;
export const selectJobDetailError = (state) => state.jobs.detailError;
export const selectFilters = (state) => state.jobs.filters;
export const selectPagination = (state) => state.jobs.pagination;

export default jobSlice.reducer;
