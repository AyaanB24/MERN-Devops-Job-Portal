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

// ─────────────────────────────────────────────────────────────────────────────
// ManageJobsPage — Recruiter views their posted jobs and clicks to see applicants.
// ─────────────────────────────────────────────────────────────────────────────

const JOB_TYPE_COLORS = {
  'Full-time': 'bg-green-100 text-green-700',
  'Part-time': 'bg-yellow-100 text-yellow-700',
  Contract: 'bg-blue-100 text-blue-700',
  Internship: 'bg-purple-100 text-purple-700',
  Remote: 'bg-cyan-100 text-cyan-700',
};

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
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 mb-4">You need to set up a company profile first.</p>
        <button
          onClick={() => navigate('/recruiter/company')}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Setup Company
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Jobs</h1>
          <p className="text-sm text-gray-500">View your active job postings and manage applicants.</p>
        </div>
        <Link
          to="/recruiter/jobs/create"
          className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition shrink-0"
        >
          + Post New Job
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
            <div key={i} className="h-24 bg-gray-100 rounded-2xl w-full" />
          ))}
        </div>
      )}

      {isEmpty && (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-base font-medium">No jobs posted yet</p>
          <p className="text-sm mt-1 mb-6">Create your first job posting to start hiring.</p>
        </div>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Type & Location</th>
                  <th className="px-6 py-4">Date Posted</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => {
                  const badgeClass = JOB_TYPE_COLORS[job.jobType] || 'bg-gray-100 text-gray-600';
                  const date = new Date(job.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  });

                  return (
                    <tr key={job._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link to={`/jobs/${job._id}`} className="font-medium text-gray-900 hover:text-indigo-600 hover:underline">
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block mb-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                          {job.jobType}
                        </span>
                        <div className="text-xs text-gray-400">{job.location}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{date}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/recruiter/jobs/${job._id}/applicants`}
                          className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                        >
                          View Applicants →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobsPage;
