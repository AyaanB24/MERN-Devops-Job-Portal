import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchJobsList,
  selectJobs,
  selectJobListStatus,
  selectPagination,
} from '../jobs/jobSlice';
import {
  removeJob,
  clearDeleteState,
  selectDeleteStatus,
} from './adminSlice';

// ─────────────────────────────────────────────────────────────────────────────
// AdminJobManagementPage — View all active jobs and delete inappropriate ones.
// ─────────────────────────────────────────────────────────────────────────────

const AdminJobManagementPage = () => {
  const dispatch = useDispatch();

  const jobs = useSelector(selectJobs);
  const status = useSelector(selectJobListStatus);
  const { currentPage, totalPages } = useSelector(selectPagination);
  const deleteStatus = useSelector(selectDeleteStatus);

  useEffect(() => {
    // Fetch all jobs globally (no filters)
    dispatch(fetchJobsList({ filters: {}, page: 1, limit: 20 }));
    return () => { dispatch(clearDeleteState()); };
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job listing? This will also remove associated applications.')) {
      const result = await dispatch(removeJob(id));
      if (removeJob.fulfilled.match(result)) {
        toast.success('Job deleted successfully');
        dispatch(fetchJobsList({ filters: {}, page: currentPage, limit: 20 }));
      } else {
        toast.error(result.payload || 'Failed to delete job');
      }
    }
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchJobsList({ filters: {}, page: newPage, limit: 20 }));
  };

  const isLoading = status === 'loading';

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Review all active job postings on the platform.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl w-full" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-100 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link to={`/jobs/${job._id}`} className="font-medium text-gray-900 hover:text-indigo-600 hover:underline">
                        {job.title}
                      </Link>
                      <div className="text-xs text-gray-400 mt-0.5">{job.location} • {job.jobType}</div>
                    </td>
                    <td className="px-6 py-4">{job.company?.companyName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        disabled={deleteStatus === 'loading'}
                        onClick={() => handleDelete(job._id)}
                        className="text-red-500 hover:text-red-700 font-semibold text-xs disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminJobManagementPage;
