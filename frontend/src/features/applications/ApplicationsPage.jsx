import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  getApplicationsList,
  selectApplications,
  selectApplicationStatus,
  selectApplicationError,
} from './applicationSlice';

// ─────────────────────────────────────────────────────────────────────────────
// ApplicationsPage — Candidate's "My Applications" tracker.
// Fetches the candidate's applications on mount.
// Backend auto-filters by req.user.id when role = 'candidate'.
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const ApplicationsPage = () => {
  const dispatch = useDispatch();
  const applications = useSelector(selectApplications);
  const status = useSelector(selectApplicationStatus);
  const error = useSelector(selectApplicationError);

  useEffect(() => {
    dispatch(getApplicationsList());
  }, [dispatch]);

  const isLoading = status === 'loading';
  const isEmpty = status === 'succeeded' && applications.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
      <p className="text-sm text-gray-500 mb-8">Track the status of every job you've applied to.</p>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm mt-1 mb-6">Start exploring and applying to jobs.</p>
          <Link
            to="/jobs"
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Browse Jobs
          </Link>
        </div>
      )}

      {/* Application list */}
      {!isLoading && applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((app) => {
            const badgeClass = STATUS_STYLES[app.status] || 'bg-gray-100 text-gray-600';
            const date = new Date(app.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            });

            return (
              <div
                key={app._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4 hover:shadow-md transition"
              >
                <div className="min-w-0">
                  <Link
                    to={`/jobs/${app.job?._id}`}
                    className="text-base font-semibold text-gray-900 hover:text-indigo-600 transition truncate block"
                  >
                    {app.job?.title || 'Job Title'}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5">Applied on {date}</p>
                  {app.coverLetter && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                      {app.coverLetter}
                    </p>
                  )}
                </div>

                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full capitalize ${badgeClass}`}>
                  {app.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
