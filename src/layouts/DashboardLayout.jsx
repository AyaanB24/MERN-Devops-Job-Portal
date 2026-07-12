import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopHeader from '../components/layout/TopHeader';

// ─────────────────────────────────────────────────────────────────────────────
// DashboardLayout — Sidebar + TopHeader + page content
// Used for all authenticated routes (candidate, recruiter, admin).
// ─────────────────────────────────────────────────────────────────────────────

const getPageTitle = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length < 2) return 'Dashboard';

  const section = segments[0]; // candidate, recruiter, admin
  const page = segments[1];

  const titles = {
    candidate: {
      dashboard: 'Dashboard',
      profile: 'My Profile',
      applications: 'My Applications',
    },
    recruiter: {
      dashboard: 'Dashboard',
      company: 'Company Profile',
      jobs: segments[2] === 'create' ? 'Create Job' : segments[2] === 'manage' ? 'Manage Jobs' : segments[2] === 'applicants' ? 'View Applicants' : 'Jobs',
    },
    admin: {
      dashboard: 'Admin Dashboard',
      users: 'User Management',
      jobs: 'Job Moderation',
    },
  };

  return titles[section]?.[page] || 'Dashboard';
};

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onMenuClick={() => setSidebarOpen(true)} title={pageTitle} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
