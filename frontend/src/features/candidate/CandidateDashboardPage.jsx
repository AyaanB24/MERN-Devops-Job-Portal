import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import {
  getApplicationsList,
  selectApplications,
  selectApplicationStatus,
} from '../applications/applicationSlice';

// ─────────────────────────────────────────────────────────────────────────────
// CandidateDashboardPage — Landing page after candidate login.
// Shows quick stats (applications, profile status) and action links.
// ─────────────────────────────────────────────────────────────────────────────

const CandidateDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const applications = useSelector(selectApplications);
  const appStatus = useSelector(selectApplicationStatus);

  useEffect(() => {
    if (appStatus === 'idle') {
      dispatch(getApplicationsList());
    }
  }, [dispatch, appStatus]);

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  const hasResume = !!user?.resume;
  const hasBio = !!user?.bio;
  const hasSkills = user?.skills?.length > 0;
  const profileComplete = hasResume && hasBio && hasSkills;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Candidate'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's your career activity at a glance.</p>
      </div>

      {/* Profile Completeness */}
      {!profileComplete && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-1">
              {!hasBio && '• Add a bio  '}
              {!hasSkills && '• Add skills  '}
              {!hasResume && '• Upload resume'}
            </p>
            <Link
              to="/candidate/profile"
              className="mt-2 inline-block text-xs font-semibold text-amber-700 hover:underline"
            >
              Go to Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applied', value: applications.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pending', value: pendingCount, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Accepted', value: acceptedCount, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Rejected', value: rejectedCount, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 text-center`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Browse Jobs', desc: 'Search and discover new opportunities', icon: '🔍', to: '/jobs' },
          { label: 'My Applications', desc: 'Track the status of your applications', icon: '📋', to: '/candidate/applications' },
          { label: 'Edit Profile', desc: 'Update bio, skills, and resume', icon: '✏️', to: '/candidate/profile' },
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

export default CandidateDashboardPage;
