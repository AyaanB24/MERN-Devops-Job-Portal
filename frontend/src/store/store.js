import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// ─────────────────────────────────────────────────────────────────────────────
// Redux Store
// RTK's configureStore automatically applies:
//   - redux-thunk middleware (for createAsyncThunk)
//   - Redux DevTools Extension support in development
// ─────────────────────────────────────────────────────────────────────────────
const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
