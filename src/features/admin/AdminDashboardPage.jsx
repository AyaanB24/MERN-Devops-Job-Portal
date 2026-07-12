import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchAnalytics,
  selectAnalytics,
  selectAnalyticsStatus,
  selectAnalyticsError,
} from './adminSlice';
import Card from '../../components/ui/Card';

// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboardPage — Platform overview and analytics
// Wrapped by DashboardLayout (Sidebar + TopHeader).
// ─────────────────────────────────────────────────────────────────────────────

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const analytics = useSelector(selectAnalytics);
  const status = useSelector(selectAnalyticsStatus);
  const error = useSelector(selectAnalyticsError);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const isLoading = status === 'loading';

  const stats = [
    { label: 'Total Users', value: analytics?.users?.total ?? 0, color: 'text-blue-600', bg: 'bg-blue-50', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.5 12.5 0 018.624 21c-2.831 0-5.464-.717-7.752-1.964M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm7.5 0a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z' },
    { label: 'Total Jobs', value: analytics?.jobs?.total ?? 0, color: 'text-violet-600', bg: 'bg-violet-50', icon: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.887.356-5.79.007-8.525-1.031a19.838 19.838 0 01-5.989-3.546 19.838 19.838 0 01-3.546-5.989 19.838 19.838 0 01-1.031-8.525C.96 3.354 1.902 2.567 2.996 2.567h4.25c.96 0 1.773.68 1.965 1.621.226 1.114.643 2.18 1.234 3.153a2 2 0 01-.455 2.583l-1.27 1.27a16.05 16.05 0 006.018 6.018l1.27-1.27a2 2 0 012.583-.455c.973.591 2.039 1.008 3.153 1.234.941.192 1.621 1.005 1.621 1.965z' },
    { label: 'Total Applications', value: analytics?.applications?.total ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z' },
    { label: 'Total Companies', value: analytics?.companies?.total ?? 0, color: 'text-cyan-600', bg: 'bg-cyan-50', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-6.75 3H21m-6.75 3H21' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview and management.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className={`${stat.bg} border-0`}>
            <div className="flex items-center justify-between mb-3">
              <svg className={`w-8 h-8 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </div>
            {isLoading ? (
              <div className="h-10 w-20 bg-white/40 animate-pulse rounded mb-2" />
            ) : (
              <p className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            )}
            <p className="text-sm font-medium text-slate-700">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Application Status Breakdown */}
      {!isLoading && analytics?.applications?.byStatus && (
        <Card className="mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Application Status Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Pending', value: analytics.applications.byStatus.pending ?? 0, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Accepted', value: analytics.applications.byStatus.accepted ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Rejected', value: analytics.applications.byStatus.rejected ?? 0, color: 'text-red-600', bg: 'bg-red-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-lg p-4 text-center`}>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-slate-900 mb-4">Management Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.5 12.5 0 018.624 21c-2.831 0-5.464-.717-7.752-1.964M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm7.5 0a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">User Management</h3>
            <p className="text-sm text-slate-500 mt-1">View, search, and manage platform users. Remove violating accounts.</p>
          </div>
        </Link>
        <Link
          to="/admin/jobs"
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.887.356-5.79.007-8.525-1.031a19.838 19.838 0 01-5.989-3.546 19.838 19.838 0 01-3.546-5.989 19.838 19.838 0 01-1.031-8.525C.96 3.354 1.902 2.567 2.996 2.567h4.25c.96 0 1.773.68 1.965 1.621.226 1.114.643 2.18 1.234 3.153a2 2 0 01-.455 2.583l-1.27 1.27a16.05 16.05 0 006.018 6.018l1.27-1.27a2 2 0 012.583-.455c.973.591 2.039 1.008 3.153 1.234.941.192 1.621 1.005 1.621 1.965z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">Job Moderation</h3>
            <p className="text-sm text-slate-500 mt-1">Review all active job postings. Remove spam or inappropriate listings.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
