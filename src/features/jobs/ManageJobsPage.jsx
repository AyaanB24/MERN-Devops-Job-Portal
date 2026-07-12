import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchRecruiterJobs,
  selectJobs,
  selectJobListStatus,
  selectJobListError,
} from './jobSlice';
import { fetchMyCompany, selectCurrentCompany } from '../company/companySlice';
import { formatDate } from '../../utils/formatDate';
import { JOB_TYPE_COLORS } from '../../config/constants';

// ─────────────────────────────────────────────────────────────────────────────
// ManageJobsPage — Recruiter views their posted jobs.
// Wrapped by DashboardLayout (Sidebar + TopHeader).
// ─────────────────────────────────────────────────────────────────────────────

const ManageJobsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const company = useSelector(selectCurrentCompany);
  const jobs = useSelector(selectJobs);
  const status = useSelector(selectJobListStatus);
  const error = useSelector(selectJobListError);

  useEffect(() => {
    dispatch(fetchMyCompany());
    dispatch(fetchRecruiterJobs());
  }, [dispatch]);

  const isLoading = status === 'loading';
  const isEmpty = status === 'succeeded' && jobs.length === 0;

  if (!company && status !== 'loading') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-slate-500 mb-4">You need to set up a company profile first.</p>
        <button
          onClick={() => navigate('/recruiter/company')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Setup Company
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Manage Jobs</h1>
          <p className="text-sm text-slate-500">View your active job postings and manage applicants.</p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shrink-0 inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Post New Job
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl w-full" />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <svg className="mx-auto w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9-9 0 00-9-9z" />
          </svg>
          <p className="text-base font-medium text-slate-600">No jobs posted yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">Create your first job posting to start hiring.</p>
        </div>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Type & Location</th>
                  <th className="px-6 py-4">Date Posted</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/jobs/${job._id}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block mb-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${JOB_TYPE_COLORS[job.jobType] || 'bg-slate-100 text-slate-700'}`}>
                        {job.jobType}
                      </span>
                      <div className="text-xs text-slate-400">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(job.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        View Applicants →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobsPage;
