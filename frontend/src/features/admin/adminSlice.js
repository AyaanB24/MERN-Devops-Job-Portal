import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as adminApi from '../../services/adminApi';

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────────────────────────────────────

export const fetchAnalytics = createAsyncThunk(
  'admin/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminApi.getAnalytics();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchUsersList = createAsyncThunk(
  'admin/fetchUsersList',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await adminApi.getUsers(page, limit);
      return response; // { success, data, pagination }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const removeUser = createAsyncThunk(
  'admin/removeUser',
  async (userId, { rejectWithValue }) => {
    try {
      await adminApi.deleteUser(userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const removeJob = createAsyncThunk(
  'admin/removeJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await adminApi.deleteJobAsAdmin(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete job');
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  analytics: null,
  analyticsStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  analyticsError: null,

  users: [],
  userPagination: { page: 1, totalPages: 1 },
  usersStatus: 'idle',
  usersError: null,

  deleteStatus: 'idle',
  deleteError: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearDeleteState: (state) => {
      state.deleteStatus = 'idle';
      state.deleteError = null;
    },
    // Allows local removal of a job from the UI state after delete
    // Note: jobs are managed in jobSlice, but we might fetch them via jobSlice and delete via adminSlice
    // Actually, we'll just re-fetch or rely on jobSlice for the jobs list.
  },
  extraReducers: (builder) => {
    // ── Analytics ──────────────────────────────────────────────────────────
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsStatus = 'loading';
        state.analyticsError = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsStatus = 'succeeded';
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsStatus = 'failed';
        state.analyticsError = action.payload;
      });

    // ── Users List ─────────────────────────────────────────────────────────
    builder
      .addCase(fetchUsersList.pending, (state) => {
        state.usersStatus = 'loading';
        state.usersError = null;
      })
      .addCase(fetchUsersList.fulfilled, (state, action) => {
        state.usersStatus = 'succeeded';
        state.users = action.payload.data;
        if (action.payload.pagination) {
          state.userPagination = action.payload.pagination;
        }
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.usersError = action.payload;
      });

    // ── Remove User ────────────────────────────────────────────────────────
    builder
      .addCase(removeUser.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(removeUser.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.users = state.users.filter(u => u._id !== action.payload);
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.payload;
      });

    // ── Remove Job ────────────────────────────────────────────────────────
    builder
      .addCase(removeJob.pending, (state) => {
        state.deleteStatus = 'loading';
        state.deleteError = null;
      })
      .addCase(removeJob.fulfilled, (state) => {
        state.deleteStatus = 'succeeded';
      })
      .addCase(removeJob.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.deleteError = action.payload;
      });
  },
});

export const { clearDeleteState } = adminSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────────────────────────────────────
export const selectAnalytics = (state) => state.admin.analytics;
export const selectAnalyticsStatus = (state) => state.admin.analyticsStatus;
export const selectAnalyticsError = (state) => state.admin.analyticsError;

export const selectUsers = (state) => state.admin.users;
export const selectUserPagination = (state) => state.admin.userPagination;
export const selectUsersStatus = (state) => state.admin.usersStatus;
export const selectUsersError = (state) => state.admin.usersError;

export const selectDeleteStatus = (state) => state.admin.deleteStatus;
export const selectDeleteError = (state) => state.admin.deleteError;

export default adminSlice.reducer;
