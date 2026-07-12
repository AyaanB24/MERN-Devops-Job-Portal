import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchJobApplicants,
  updateApplicantStatus,
  selectApplications,
  selectApplicationStatus,
  selectApplicationError,
  selectUpdateStatus,
} from './applicationSlice';
import { fetchJobDetail, selectCurrentJob } from '../jobs/jobSlice';

// ─────────────────────────────────────────────────────────────────────────────
// ViewApplicantsPage — Recruiter views applications for a specific job
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const ViewApplicantsPage = () => {
  const { id: jobId } = useParams();
  const dispatch = useDispatch();

  const applicants = useSelector(selectApplications);
  const listStatus = useSelector(selectApplicationStatus);
  const listError = useSelector(selectApplicationError);
  const updateStatus = useSelector(selectUpdateStatus);
  
  const job = useSelector(selectCurrentJob);

  useEffect(() => {
    dispatch(fetchJobDetail(jobId));
    dispatch(fetchJobApplicants(jobId));
  }, [dispatch, jobId]);

  const handleStatusUpdate = async (appId, newStatus) => {
    const result = await dispatch(updateApplicantStatus({ id: appId, status: newStatus }));
    if (updateApplicantStatus.fulfilled.match(result)) {
      toast.success(`Applicant ${newStatus} successfully!`);
    } else {
      toast.error(result.payload || 'Failed to update applicant');
    }
  };

  const isLoading = listStatus === 'loading';
  const isUpdating = updateStatus === 'loading';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link to="/recruiter/jobs/manage" className="text-sm text-indigo-600 hover:underline mb-2 inline-block">
          ← Back to Manage Jobs
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Applicants for "{job?.title || 'Job'}"
        </h1>
        <p className="text-sm text-gray-500 mt-1">Review candidate profiles and update their application status.</p>
      </div>

      {listError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {listError}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl w-full" />
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-base font-medium">No applicants yet</p>
          <p className="text-sm mt-1">Candidates who apply will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div key={app._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
              
              {/* Candidate Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-lg font-bold text-indigo-600">
                    {app.candidate?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{app.candidate?.name}</h3>
                    <p className="text-sm text-gray-500">{app.candidate?.email}</p>
                  </div>
                </div>
                
                {app.coverLetter && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-1">Cover Letter:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.coverLetter}</p>
                  </div>
                )}
              </div>

              {/* Actions & Status */}
              <div className="shrink-0 flex flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${STATUS_COLORS[app.status]}`}>
                  {app.status}
                </span>

                <div className="flex flex-col gap-2 w-full mt-2">
                  {/* Mock resume download link - assuming static folder setup on backend */}
                  <a
                    href={`http://localhost:5000${app.candidate?.resume}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-4 py-2 text-center text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                    onClick={(e) => {
                      if (!app.candidate?.resume) {
                        e.preventDefault();
                        alert('Candidate has not uploaded a resume.');
                      }
                    }}
                  >
                    View Resume
                  </a>
                  
                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(app._id, 'accepted')}
                        className="flex-1 px-4 py-2 text-xs font-semibold bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(app._id, 'rejected')}
                        className="flex-1 px-4 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewApplicantsPage;
