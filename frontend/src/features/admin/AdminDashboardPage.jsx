import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAnalytics, selectAnalytics, selectAnalyticsStatus, selectAnalyticsError } from './adminSlice';
import { selectCurrentUser } from '../auth/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// AdminDashboardPage — Platform overview and analytics
// ─────────────────────────────────────────────────────────────────────────────

const AdminDashboardPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const analytics = useSelector(selectAnalytics);
  const status = useSelector(selectAnalyticsStatus);
  const error = useSelector(selectAnalyticsError);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const isLoading = status === 'loading';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and management.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* ── Analytics Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: analytics?.users || 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Jobs', value: analytics?.jobs || 0, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Applications', value: analytics?.applications || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Companies', value: analytics?.companies || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} rounded-2xl p-6 relative overflow-hidden`}>
            {isLoading ? (
              <div className="h-10 w-20 bg-white/40 animate-pulse rounded mb-2" />
            ) : (
              <p className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
            )}
            <p className="text-sm font-medium text-gray-700">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────────── */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Management Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            👥
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">User Management</h3>
            <p className="text-sm text-gray-500 mt-1">View, search, and manage platform users. Remove violating accounts.</p>
          </div>
        </Link>
        <Link
          to="/admin/jobs"
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            💼
          </div>
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Job Moderation</h3>
            <p className="text-sm text-gray-500 mt-1">Review all active job postings. Remove spam or inappropriate listings.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
