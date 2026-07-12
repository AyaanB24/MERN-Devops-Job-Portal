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
import { STATUS_COLORS } from '../../config/constants';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

// ─────────────────────────────────────────────────────────────────────────────
// ViewApplicantsPage — Recruiter views applications for a specific job
// Wrapped by DashboardLayout (Sidebar + TopHeader).
// ─────────────────────────────────────────────────────────────────────────────

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/recruiter/jobs/manage" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l11.25-7.5" />
          </svg>
          Back to Manage Jobs
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          Applicants for "{job?.title || 'Job'}"
        </h1>
        <p className="text-sm text-slate-500 mt-1">Review candidate profiles and update their application status.</p>
      </div>

      {listError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {listError}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl w-full" />
          ))}
        </div>
      ) : applicants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <svg className="mx-auto w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.5 12.5 0 018.624 21c-2.831 0-5.464-.717-7.752-1.964M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm7.5 0a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
          </svg>
          <p className="text-base font-medium text-slate-600">No applicants yet</p>
          <p className="text-sm text-slate-400 mt-1">Candidates who apply will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applicants.map((app) => (
            <div key={app._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row gap-6 justify-between items-start">
              {/* Candidate Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={app.candidate?.name} size="md" />
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{app.candidate?.name}</h3>
                    <p className="text-sm text-slate-500">{app.candidate?.email}</p>
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Cover Letter:</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{app.coverLetter}</p>
                  </div>
                )}
              </div>

              {/* Actions & Status */}
              <div className="shrink-0 flex flex-col items-end gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[app.status] || STATUS_COLORS.pending}`}>
                  {app.status}
                </span>

                <div className="flex flex-col gap-2 w-full mt-2">
                  <a
                    href={`http://localhost:5000${app.candidate?.resume}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-4 py-2 text-center text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
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
                      <Button
                        variant="success"
                        size="sm"
                        loading={isUpdating}
                        onClick={() => handleStatusUpdate(app._id, 'accepted')}
                        className="flex-1"
                      >
                        Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={isUpdating}
                        onClick={() => handleStatusUpdate(app._id, 'rejected')}
                        className="flex-1"
                      >
                        Reject
                      </Button>
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
