import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, getProfile, updateUserProfile, uploadUserResume } from '../../services/authApi';

// ─────────────────────────────────────────────────────────────────────────────
// ASYNC THUNKS
// Each thunk handles one auth flow. Errors are caught and returned via
// rejectWithValue so the slice reducers can set a meaningful error message.
// ─────────────────────────────────────────────────────────────────────────────

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await loginUser(credentials);
      localStorage.setItem('token', data.token);
      return data; // { token, user }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await registerUser(userData);
      localStorage.setItem('token', data.token);
      return data; // { token, user }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// Called once on app boot (main.jsx / App.jsx) to rehydrate session from
// a persisted token in localStorage without requiring a new login.
export const loadUserFromToken = createAsyncThunk(
  'auth/loadUserFromToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('No token found');
      const data = await getProfile();
      return { ...data, token }; // { user, token }
    } catch (error) {
      localStorage.removeItem('token'); // Token is stale — clean up
      return rejectWithValue('Session expired');
    }
  }
);

// Updates profile details (bio, skills, etc.)
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const data = await updateUserProfile(profileData);
      return data; // { success, data: User }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

// Uploads resume PDF
export const uploadResume = createAsyncThunk(
  'auth/uploadResume',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await uploadUserResume(formData);
      return data; // { success, message, file }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Resume upload failed');
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────
const initialState = {
  user: null,           // { _id, name, email, role, ... }
  token: null,          // JWT string
  isAuthenticated: false,
  status: 'idle',       // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Synchronous logout — clears Redux state and localStorage token.
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('token');
    },
    // Clear any stale errors before showing a form again.
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──────────────────────────────────────────────────────────────
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── Register ───────────────────────────────────────────────────────────
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── Load User From Token (app boot) ────────────────────────────────────
    builder
      .addCase(loadUserFromToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadUserFromToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loadUserFromToken.rejected, (state) => {
        state.status = 'idle'; // Silently fail — user just needs to log in
        state.isAuthenticated = false;
      });

    // ── Update Profile ─────────────────────────────────────────────────────
    builder
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data; // Server returns { success, data: updatedUser }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });

    // ── Upload Resume ──────────────────────────────────────────────────────
    builder
      .addCase(uploadResume.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (state.user) {
          state.user.resume = action.payload.file.path; // Update resume path in state
        }
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — co-locate with the slice for easy imports
// ─────────────────────────────────────────────────────────────────────────────
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
