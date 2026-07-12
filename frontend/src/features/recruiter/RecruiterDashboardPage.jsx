import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { fetchMyCompany, selectCurrentCompany, selectCompanyStatus } from '../company/companySlice';

// ─────────────────────────────────────────────────────────────────────────────
// RecruiterDashboardPage — Landing page after recruiter login.
// Shows company setup prompt and quick-action links.
// ─────────────────────────────────────────────────────────────────────────────

const RecruiterDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const company = useSelector(selectCurrentCompany);
  const companyStatus = useSelector(selectCompanyStatus);

  useEffect(() => {
    if (companyStatus === 'idle') {
      dispatch(fetchMyCompany());
    }
  }, [dispatch, companyStatus]);

  const hasCompany = !!company;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Recruiter'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your company's hiring process.</p>
      </div>

      {/* Company Setup Warning */}
      {!hasCompany && companyStatus === 'succeeded' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Set up your Company Profile</p>
            <p className="text-xs text-amber-600 mt-1">
              You need to create a company profile before you can post jobs.
            </p>
            <Link
              to="/recruiter/company"
              className="mt-2 inline-block text-xs font-semibold text-amber-700 hover:underline"
            >
              Create Company Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Company Profile', desc: 'Update company details and branding', icon: '🏢', to: '/recruiter/company' },
          { label: 'Post a New Job', desc: 'Create a new job listing', icon: '📝', to: '/recruiter/jobs/create' },
          { label: 'Manage Jobs', desc: 'View and manage your active job postings', icon: '💼', to: '/recruiter/jobs/manage' },
        ].map(({ label, desc, icon, to }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <span className="text-2xl">{icon}</span>
            <h3 className="mt-3 text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
              {label}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboardPage;
