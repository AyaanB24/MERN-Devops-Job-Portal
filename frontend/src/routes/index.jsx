import { createBrowserRouter } from 'react-router-dom';

// Guards
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

// Pages
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';

// ─── Placeholder pages (built in later phases) ───────────────────────────────
const Placeholder = ({ label }) => (
  <div className="flex items-center justify-center min-h-screen text-xl font-semibold text-gray-400">
    {label} — Coming soon
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Route tree
// ─────────────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────────────
  { path: '/', element: <HomePage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },
  { path: '*', element: <NotFoundPage /> },

  // ── Guest-only routes (login / register) ───────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // ── Candidate routes ───────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['candidate']} />,
    children: [
      { path: '/candidate/dashboard', element: <Placeholder label="Candidate Dashboard" /> },
      { path: '/candidate/profile', element: <Placeholder label="Candidate Profile" /> },
      { path: '/candidate/applications', element: <Placeholder label="My Applications" /> },
    ],
  },

  // ── Recruiter routes ───────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['recruiter']} />,
    children: [
      { path: '/recruiter/dashboard', element: <Placeholder label="Recruiter Dashboard" /> },
      { path: '/recruiter/company', element: <Placeholder label="Company Profile" /> },
      { path: '/recruiter/jobs/manage', element: <Placeholder label="Manage Jobs" /> },
      { path: '/recruiter/jobs/create', element: <Placeholder label="Create Job" /> },
      { path: '/recruiter/jobs/:id/applicants', element: <Placeholder label="Applicants" /> },
    ],
  },

  // ── Admin routes ───────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      { path: '/admin/dashboard', element: <Placeholder label="Admin Dashboard" /> },
      { path: '/admin/users', element: <Placeholder label="User Management" /> },
      { path: '/admin/jobs', element: <Placeholder label="Job Moderation" /> },
    ],
  },
]);

export default router;
