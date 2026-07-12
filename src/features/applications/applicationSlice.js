import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyToJob, fetchApplications, updateApplicationStatus as apiUpdateStatus, getJobApplicants as apiGetApplicants } from '../../services/applicationApi';

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Recruiter Thunks ─────────────────────────────────────────────────────────

export const fetchJobApplicants = createAsyncThunk(
  'applications/fetchJobApplicants',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await apiGetApplicants(jobId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch applicants');
    }
  }
);

export const updateApplicantStatus = createAsyncThunk(
  'applications/updateApplicantStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiUpdateStatus(id, status);
      return response.data; // The updated application
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
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

  updateStatus: 'idle',
  updateError: null,
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
    clearUpdateState(state) {
      state.updateStatus = 'idle';
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch applications (Candidate & Recruiter) ────────────────────────
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
      })
      // Using fetchJobApplicants populates the same items list
      .addCase(fetchJobApplicants.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchJobApplicants.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchJobApplicants.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── Submit application (Candidate) ────────────────────────────────────
    builder
      .addCase(submitApplication.pending, (state) => {
        state.submitStatus = 'loading';
        state.submitError = null;
      })
      .addCase(submitApplication.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.items.unshift(action.payload);
      })
      .addCase(submitApplication.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.submitError = action.payload;
      });

    // ── Update applicant status (Recruiter) ───────────────────────────────
    builder
      .addCase(updateApplicantStatus.pending, (state) => {
        state.updateStatus = 'loading';
        state.updateError = null;
      })
      .addCase(updateApplicantStatus.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        // Update the item in the list
        const index = state.items.findIndex((app) => app._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateApplicantStatus.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.updateError = action.payload;
      });
  },
});

export const { clearSubmitState, clearUpdateState } = applicationSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────────────────────
export const selectApplications = (state) => state.applications.items;
export const selectApplicationStatus = (state) => state.applications.status;
export const selectApplicationError = (state) => state.applications.error;
export const selectApplicationSubmitStatus = (state) => state.applications.submitStatus;
export const selectApplicationSubmitError = (state) => state.applications.submitError;
export const selectUpdateStatus = (state) => state.applications.updateStatus;
export const selectUpdateError = (state) => state.applications.updateError;

export default applicationSlice.reducer;
