import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getJobs, getJobById, createJob } from './jobService';

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
 * Fetches jobs created by the logged-in recruiter.
 */
export const fetchRecruiterJobs = createAsyncThunk(
  'jobs/fetchRecruiterJobs',
  async ({ page = 1, limit = 10 } = {}, { getState, rejectWithValue }) => {
    try {
      const recruiterId = getState().auth.user._id;
      return await getJobs({ filters: { createdBy: recruiterId }, page, limit });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your jobs');
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

/**
 * Creates a new job posting.
 */
export const createNewJob = createAsyncThunk(
  'jobs/createNewJob',
  async (jobData, { rejectWithValue }) => {
    try {
      return await createJob(jobData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create job');
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
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

  // Create Job
  createStatus: 'idle',
  createError: null,

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
    setFilter(state, action) {
      const { key, value } = action.payload; // { key: 'keyword', value: 'react' }
      state.filters[key] = value;
      state.pagination.currentPage = 1;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
    setPage(state, action) {
      state.pagination.currentPage = action.payload;
    },
    clearCurrentJob(state) {
      state.currentJob = null;
      state.detailStatus = 'idle';
      state.detailError = null;
    },
    clearCreateJobState(state) {
      state.createStatus = 'idle';
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch Job List & Recruiter Jobs ─────────────────────────────────────
    const handleFetchListPending = (state) => {
      state.listStatus = 'loading';
      state.listError = null;
    };
    const handleFetchListFulfilled = (state, action) => {
      state.listStatus = 'succeeded';
      state.jobs = action.payload.data;
      state.pagination.currentPage = action.payload.pagination.page;
      state.pagination.totalPages = action.payload.pagination.totalPages;
    };
    const handleFetchListRejected = (state, action) => {
      state.listStatus = 'failed';
      state.listError = action.payload;
    };

    builder
      .addCase(fetchJobsList.pending, handleFetchListPending)
      .addCase(fetchJobsList.fulfilled, handleFetchListFulfilled)
      .addCase(fetchJobsList.rejected, handleFetchListRejected)
      .addCase(fetchRecruiterJobs.pending, handleFetchListPending)
      .addCase(fetchRecruiterJobs.fulfilled, handleFetchListFulfilled)
      .addCase(fetchRecruiterJobs.rejected, handleFetchListRejected);

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

    // ── Create Job ────────────────────────────────────────────────────────
    builder
      .addCase(createNewJob.pending, (state) => {
        state.createStatus = 'loading';
        state.createError = null;
      })
      .addCase(createNewJob.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        state.jobs.unshift(action.payload.data); // Optionally add to top of list
      })
      .addCase(createNewJob.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.createError = action.payload;
      });
  },
});

export const { setFilter, clearFilters, setPage, clearCurrentJob, clearCreateJobState } = jobSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────────────────────
export const selectJobs = (state) => state.jobs.jobs;
export const selectJobListStatus = (state) => state.jobs.listStatus;
export const selectJobListError = (state) => state.jobs.listError;
export const selectCurrentJob = (state) => state.jobs.currentJob;
export const selectJobDetailStatus = (state) => state.jobs.detailStatus;
export const selectJobDetailError = (state) => state.jobs.detailError;
export const selectCreateJobStatus = (state) => state.jobs.createStatus;
export const selectCreateJobError = (state) => state.jobs.createError;
export const selectFilters = (state) => state.jobs.filters;
export const selectPagination = (state) => state.jobs.pagination;

export default jobSlice.reducer;

