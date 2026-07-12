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
import { JOB_TYPE_COLORS } from '../../config/constants';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/ui/Button';

// ─────────────────────────────────────────────────────────────────────────────
// AdminJobManagementPage — View all active jobs and delete inappropriate ones.
// Wrapped by DashboardLayout (Sidebar + TopHeader).
// ─────────────────────────────────────────────────────────────────────────────

const AdminJobManagementPage = () => {
  const dispatch = useDispatch();

  const jobs = useSelector(selectJobs);
  const status = useSelector(selectJobListStatus);
  const { currentPage, totalPages } = useSelector(selectPagination);
  const deleteStatus = useSelector(selectDeleteStatus);

  useEffect(() => {
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Job Moderation</h1>
        <p className="text-sm text-slate-500 mt-1">Review all active job postings on the platform.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl w-full" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Posted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link to={`/jobs/${job._id}`} className="font-medium text-slate-900 hover:text-blue-600 hover:underline">
                        {job.title}
                      </Link>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {job.location} •
                        <span className={`ml-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${JOB_TYPE_COLORS[job.jobType] || 'bg-slate-100 text-slate-700'}`}>
                          {job.jobType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{job.company?.companyName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deleteStatus === 'loading'}
                        onClick={() => handleDelete(job._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminJobManagementPage;
