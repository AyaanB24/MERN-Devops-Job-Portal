import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  getApplicationsList,
  selectApplications,
  selectApplicationStatus,
  selectApplicationError,
} from './applicationSlice';
import { STATUS_COLORS } from '../../config/constants';
import { formatDate } from '../../utils/formatDate';

// ─────────────────────────────────────────────────────────────────────────────
// ApplicationsPage — Candidate's "My Applications" tracker.
// ─────────────────────────────────────────────────────────────────────────────

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">My Applications</h1>
      <p className="text-sm text-slate-500 mb-8">Track the status of every job you've applied to.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <svg className="mx-auto w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="text-lg font-medium text-slate-600">No applications yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">Start exploring and applying to jobs.</p>
          <Link
            to="/jobs"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Jobs
          </Link>
        </div>
      )}

      {!isLoading && applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="min-w-0">
                <Link
                  to={`/jobs/${app.job?._id}`}
                  className="text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                >
                  {app.job?.title || 'Job Title'}
                </Link>
                <p className="text-sm text-slate-500 mt-0.5">Applied on {formatDate(app.createdAt)}</p>
                {app.coverLetter && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{app.coverLetter}</p>
                )}
              </div>
              <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full capitalize ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
