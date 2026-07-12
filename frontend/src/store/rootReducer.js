import authReducer from '../features/auth/authSlice';
import jobReducer from '../features/jobs/jobSlice';
import applicationReducer from '../features/applications/applicationSlice';
import companyReducer from '../features/company/companySlice';

// ─────────────────────────────────────────────────────────────────────────────
// Root Reducer — central registry for all Redux slices.
// Adding a new feature slice = add one line here. No changes needed in store.js.
// ─────────────────────────────────────────────────────────────────────────────
const rootReducer = {
  auth: authReducer,
  jobs: jobReducer,
  applications: applicationReducer,
  // company: companyReducer,
  // admin: adminReducer,
  // ui: uiReducer,
};

export default rootReducer;
