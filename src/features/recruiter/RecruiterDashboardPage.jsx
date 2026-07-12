import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import { fetchMyCompany, selectCurrentCompany, selectCompanyStatus } from '../company/companySlice';

// ─────────────────────────────────────────────────────────────────────────────
// RecruiterDashboardPage — Landing page after recruiter login.
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

  const quickActions = [
    { label: 'Company Profile', desc: 'Update company details and branding', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-6.75 3H21m-6.75 3H21', to: '/recruiter/company' },
    { label: 'Post a New Job', desc: 'Create a new job listing', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10', to: '/recruiter/jobs/create' },
    { label: 'Manage Jobs', desc: 'View and manage your active job postings', icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.887.356-5.79.007-8.525-1.031a19.838 19.838 0 01-5.989-3.546 19.838 19.838 0 01-3.546-5.989 19.838 19.838 0 01-1.031-8.525C.96 3.354 1.902 2.567 2.996 2.567h4.25c.96 0 1.773.68 1.965 1.621.226 1.114.643 2.18 1.234 3.153a2 2 0 01-.455 2.583l-1.27 1.27a16.05 16.05 0 006.018 6.018l1.27-1.27a2 2 0 012.583-.455c.973.591 2.039 1.008 3.153 1.234.941.192 1.621 1.005 1.621 1.965z', to: '/recruiter/jobs/manage' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Recruiter'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your company's hiring process.</p>
      </div>

      {/* Company Setup Warning */}
      {!hasCompany && companyStatus === 'succeeded' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <svg className="w-6 h-6 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Set up your Company Profile</p>
            <p className="text-xs text-amber-600 mt-1">You need to create a company profile before you can post jobs.</p>
            <Link to="/recruiter/company" className="mt-2 inline-block text-xs font-semibold text-amber-700 hover:underline">
              Create Company Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map(({ label, desc, icon, to }) => (
          <Link
            key={to}
            to={to}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{label}</h3>
            <p className="mt-1 text-xs text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecruiterDashboardPage;
