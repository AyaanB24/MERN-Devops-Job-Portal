import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadUserFromToken } from './features/auth/authSlice';
import router from './routes/index';

// ─────────────────────────────────────────────────────────────────────────────
// App.jsx
// The root component. On every app boot it attempts to restore the user
// session from a token persisted in localStorage, so users don't have to
// log in again after a page refresh.
// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Fires once on mount — silently succeeds or fails, no UX disruption
    dispatch(loadUserFromToken());
  }, [dispatch]);

  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
