import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyToJob, fetchApplications } from '../../services/applicationApi';

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thunk to fetch applications for the currently logged-in user (candidate or recruiter).
 */
export const getApplicationsList = createAsyncThunk(
  'applications/getApplicationsList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetchApplications(params);
      return response.data; // Array of applications
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

/**
 * Thunk for a candidate to apply for a job.
 * Payload: { job: string, coverLetter?: string }
 */
export const submitApplication = createAsyncThunk(
  'applications/submitApplication',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await applyToJob(payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit application');
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  submitStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  submitError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────
const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearSubmitState(state) {
      state.submitStatus = 'idle';
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch applications
    builder
      .addCase(getApplicationsList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getApplicationsList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(getApplicationsList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // Submit application
    builder
      .addCase(submitApplication.pending, (state) => {
        state.submitStatus = 'loading';
        state.submitError = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        // Add the new application to the list if already loaded
        state.items.unshift(action.payload);
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.payload;
      });
  },
});

export const { clearSubmitState } = applicationSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────────────────────
export const selectApplications = (state) => state.applications.items;
export const selectApplicationStatus = (state) => state.applications.status;
export const selectApplicationError = (state) => state.applications.error;
export const selectApplicationSubmitStatus = (state) => state.applications.submitStatus;
export const selectApplicationSubmitError = (state) => state.applications.submitError;

export default applicationSlice.reducer;
