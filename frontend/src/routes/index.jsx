import { createBrowserRouter } from 'react-router-dom';

// Guards
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';

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
  { path: '/jobs', element: <JobListPage /> },
  { path: '/jobs/:id', element: <JobDetailPage /> },
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
      { path: '/candidate/dashboard', element: <CandidateDashboardPage /> },
      { path: '/candidate/profile', element: <CandidateProfilePage /> },
      { path: '/candidate/applications', element: <ApplicationsPage /> },
    ],
  },

  // ── Recruiter routes ───────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={['recruiter']} />,
    children: [
      { path: '/recruiter/dashboard', element: <RecruiterDashboardPage /> },
      { path: '/recruiter/company', element: <CompanyManagementPage /> },
      { path: '/recruiter/jobs/manage', element: <ManageJobsPage /> },
      { path: '/recruiter/jobs/create', element: <CreateJobPage /> },
      { path: '/recruiter/jobs/:id/applicants', element: <ViewApplicantsPage /> },
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
