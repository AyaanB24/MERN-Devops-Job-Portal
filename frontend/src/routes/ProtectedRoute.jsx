import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole, selectAuthStatus } from '../features/auth/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute
//
// Props:
//   allowedRoles {string[]} — e.g. ['recruiter'] or ['admin'] or ['candidate','recruiter']
//                             If omitted, any authenticated user is allowed.
//
// Usage in routes/index.jsx:
//   <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
//     <Route path="/recruiter/dashboard" element={<RecruiterDashboardPage />} />
//   </Route>
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const status = useSelector(selectAuthStatus);
  const location = useLocation();

  // While the app is rehydrating from localStorage (app boot), show nothing.
  // Prevents a flash-redirect to /login before auth state is confirmed.
  if (status === 'loading') {
    return null;
  }

  // Not logged in → redirect to login, preserving intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → access denied
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and authorized → render child routes
  return <Outlet />;
};

export default ProtectedRoute;
