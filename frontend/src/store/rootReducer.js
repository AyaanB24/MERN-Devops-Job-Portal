import authReducer from '../features/auth/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// Root Reducer — central registry for all Redux slices.
// Adding a new feature slice = add one line here. No changes needed in store.js.
// ─────────────────────────────────────────────────────────────────────────────
const rootReducer = {
  auth: authReducer,
  // jobs: jobReducer,         ← plug in as features are built
  // applications: applicationReducer,
  // company: companyReducer,
  // admin: adminReducer,
  // ui: uiReducer,
};

export default rootReducer;
