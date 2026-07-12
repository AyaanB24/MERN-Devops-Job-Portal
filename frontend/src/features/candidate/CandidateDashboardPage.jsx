import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '../auth/authSlice';
import {
  getApplicationsList,
  selectApplications,
  selectApplicationStatus,
} from '../applications/applicationSlice';
import { formatDate } from '../../utils/formatDate';
import { STATUS_COLORS } from '../../config/constants';

// ─────────────────────────────────────────────────────────────────────────────
// CandidateDashboardPage — Landing page after candidate login.
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

  const stats = [
    { label: 'Total Applied', value: applications.length, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Accepted', value: acceptedCount, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected', value: rejectedCount, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const quickActions = [
    { label: 'Browse Jobs', desc: 'Search and discover new opportunities', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', to: '/jobs' },
    { label: 'My Applications', desc: 'Track the status of your applications', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z', to: '/candidate/applications' },
    { label: 'Edit Profile', desc: 'Update bio, skills, and resume', icon: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10', to: '/candidate/profile' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}
        </h1>
        <p className="text-sm text-slate-500 mt-1">Here's your career activity at a glance.</p>
      </div>

      {/* Profile Completeness */}
      {!profileComplete && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <svg className="w-6 h-6 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Complete your profile</p>
            <p className="text-xs text-amber-600 mt-1">
              {!hasBio && '• Add a bio  '}
              {!hasSkills && '• Add skills  '}
              {!hasResume && '• Upload resume'}
            </p>
            <Link to="/candidate/profile" className="mt-2 inline-block text-xs font-semibold text-amber-700 hover:underline">
              Go to Profile →
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-5 text-center`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Recent Applications</h2>
          <div className="space-y-3">
            {applications.slice(0, 5).map((app) => (
              <Link
                key={app._id}
                to={`/jobs/${app.job?._id}`}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{app.job?.title || 'Job Title'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Applied on {formatDate(app.createdAt)}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>
                  {app.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

export default CandidateDashboardPage;
