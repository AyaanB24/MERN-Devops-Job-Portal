import { createBrowserRouter } from 'react-router-dom';

// Guards
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages — Auth
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';

// Pages — Public
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import JobListPage from '../features/jobs/JobListPage';
import JobDetailPage from '../features/jobs/JobDetailPage';

// Pages — Candidate
import CandidateDashboardPage from '../features/candidate/CandidateDashboardPage';
import CandidateProfilePage from '../features/profile/CandidateProfilePage';
import ApplicationsPage from '../features/applications/ApplicationsPage';

// Pages — Recruiter
import RecruiterDashboardPage from '../features/recruiter/RecruiterDashboardPage';
import CompanyManagementPage from '../features/company/CompanyManagementPage';
import ManageJobsPage from '../features/jobs/ManageJobsPage';
import CreateJobPage from '../features/jobs/CreateJobPage';
import ViewApplicantsPage from '../features/applications/ViewApplicantsPage';

// Pages — Admin
import AdminDashboardPage from '../features/admin/AdminDashboardPage';
import AdminUserManagementPage from '../features/admin/AdminUserManagementPage';
import AdminJobManagementPage from '../features/admin/AdminJobManagementPage';

// ─────────────────────────────────────────────────────────────────────────────
// Route tree
// ─────────────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public routes (Navbar + Footer) ────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/jobs', element: <JobListPage /> },
      { path: '/jobs/:id', element: <JobDetailPage /> },
      { path: '/unauthorized', element: <UnauthorizedPage /> },
    ],
  },

  // ── Guest-only routes (login / register) ───────────────────────────────
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },

  // ── Candidate routes ───────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['candidate']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/candidate/dashboard', element: <CandidateDashboardPage /> },
          { path: '/candidate/profile', element: <CandidateProfilePage /> },
          { path: '/candidate/applications', element: <ApplicationsPage /> },
        ],
      },
    ],
  },

  // ── Recruiter routes ───────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['recruiter']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/recruiter/dashboard', element: <RecruiterDashboardPage /> },
          { path: '/recruiter/company', element: <CompanyManagementPage /> },
          { path: '/recruiter/jobs/manage', element: <ManageJobsPage /> },
          { path: '/recruiter/jobs/create', element: <CreateJobPage /> },
          { path: '/recruiter/jobs/:id/applicants', element: <ViewApplicantsPage /> },
        ],
      },
    ],
  },

  // ── Admin routes ──────────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/admin/dashboard', element: <AdminDashboardPage /> },
          { path: '/admin/users', element: <AdminUserManagementPage /> },
          { path: '/admin/jobs', element: <AdminJobManagementPage /> },
        ],
      },
    ],
  },

  // ── Catch-all ──────────────────────────────────────────────────────────
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
