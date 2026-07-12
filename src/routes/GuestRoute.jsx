import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../features/auth/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// GuestRoute — Only accessible to unauthenticated users.
//
// Redirects authenticated users to their role-specific dashboard.
// Prevents logged-in users from seeing the Login/Register pages.
//
// Usage in routes/index.jsx:
//   <Route element={<GuestRoute />}>
//     <Route path="/login" element={<LoginPage />} />
//     <Route path="/register" element={<RegisterPage />} />
//   </Route>
// ─────────────────────────────────────────────────────────────────────────────

// Maps a user role to their default landing dashboard
const ROLE_DASHBOARD = {
  candidate: '/candidate/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

const GuestRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  if (isAuthenticated) {
    const redirectPath = ROLE_DASHBOARD[role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;
