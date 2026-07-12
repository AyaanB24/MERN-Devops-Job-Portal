import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as companyApi from '../../services/companyApi';

// ─────────────────────────────────────────────────────────────────────────────
// Company Slice — Manages recruiter's company profile
// ─────────────────────────────────────────────────────────────────────────────

export const fetchMyCompany = createAsyncThunk(
  'company/fetchMyCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await companyApi.getMyCompanies();
      // Assume the first company is the primary company for this recruiter
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch company');
    }
  }
);

export const saveCompany = createAsyncThunk(
  'company/saveCompany',
  async ({ id, companyData }, { rejectWithValue }) => {
    try {
      if (id) {
        const response = await companyApi.updateCompany(id, companyData);
        return response.data;
      } else {
        const response = await companyApi.createCompany(companyData);
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save company');
    }
  }
);

const initialState = {
  currentCompany: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  saveStatus: 'idle',
  saveError: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearCompanyState: (state) => {
      state.saveStatus = 'idle';
      state.saveError = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Company
      .addCase(fetchMyCompany.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMyCompany.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentCompany = action.payload;
      })
      .addCase(fetchMyCompany.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Save Company
      .addCase(saveCompany.pending, (state) => {
        state.saveStatus = 'loading';
        state.saveError = null;
      })
      .addCase(saveCompany.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.currentCompany = action.payload;
      })
      .addCase(saveCompany.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.saveError = action.payload;
      });
  },
});

export const { clearCompanyState } = companySlice.actions;

export const selectCurrentCompany = (state) => state.company.currentCompany;
export const selectCompanyStatus = (state) => state.company.status;
export const selectCompanyError = (state) => state.company.error;
export const selectCompanySaveStatus = (state) => state.company.saveStatus;
export const selectCompanySaveError = (state) => state.company.saveError;

export default companySlice.reducer;
