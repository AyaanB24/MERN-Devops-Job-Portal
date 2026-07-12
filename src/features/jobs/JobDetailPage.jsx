import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJobDetail,
  clearCurrentJob,
  selectCurrentJob,
  selectJobDetailStatus,
  selectJobDetailError,
} from './jobSlice';
import { selectIsAuthenticated, selectUserRole } from '../auth/authSlice';
import {
  submitApplication,
  clearSubmitState,
  selectApplicationSubmitStatus,
  selectApplicationSubmitError,
} from '../applications/applicationSlice';
import { JOB_TYPE_COLORS } from '../../config/constants';
import { formatSalary } from '../../utils/formatSalary';
import { formatDate as formatDateUtil } from '../../utils/formatDate';

// ─────────────────────────────────────────────────────────────────────────────
// JobDetailPage — Public. Fetches a single job by :id URL param.
// ─────────────────────────────────────────────────────────────────────────────

const JobDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const job = useSelector(selectCurrentJob);
  const status = useSelector(selectJobDetailStatus);
  const error = useSelector(selectJobDetailError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  const submitStatus = useSelector(selectApplicationSubmitStatus);
  const submitError = useSelector(selectApplicationSubmitError);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (id) dispatch(fetchJobDetail(id));
    return () => {
      dispatch(clearCurrentJob());
      dispatch(clearSubmitState());
    };
  }, [dispatch, id]);

  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const isCandidate = isAuthenticated && role === 'candidate';

  const handleApply = async (e) => {
    e.preventDefault();
    const result = await dispatch(submitApplication({ job: id, coverLetter }));
    if (submitApplication.fulfilled.match(result)) {
      setShowApplyForm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <p className="text-slate-600">{error || 'Job not found.'}</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-6 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) return null;

  const { title, description, salary, location, experience, jobType, skills = [], company, createdAt } = job;
  const badgeClass = JOB_TYPE_COLORS[jobType] || 'bg-slate-100 text-slate-700';
  const postedDate = formatDateUtil(createdAt, { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/jobs" className="inline-flex items-center text-sm text-blue-600 hover:underline mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l11.25-7.5" />
          </svg>
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                  <p className="mt-1 text-slate-500 font-medium">{company?.companyName}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
                  {jobType}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-5 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                  {location}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.887.356-5.79.007-8.525-1.031a19.838 19.838 0 01-5.989-3.546 19.838 19.838 0 01-3.546-5.989 19.838 19.838 0 01-1.031-8.525C.96 3.354 1.902 2.567 2.996 2.567h4.25c.96 0 1.773.68 1.965 1.621.226 1.114.643 2.18 1.234 3.153a2 2 0 01-.455 2.583l-1.27 1.27a16.05 16.05 0 006.018 6.018l1.27-1.27a2 2 0 012.583-.455c.973.591 2.039 1.008 3.153 1.234.941.192 1.621 1.005 1.621 1.965z" /></svg>
                  {experience}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125V9M12 3v3m6-3v9m-9 0V9.75C9 9.336 8.664 9 8.25 9H6.75c-.414 0-.75.336-.75.75v6c0 .414.336.75.75.75h1.5c.414 0 .75-.336.75-.75V9z" /></svg>
                  {formatSalary(salary)}/yr
                </span>
                <span>Posted {postedDate}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-3">Job Description</h2>
              <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{description}</p>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              {submitStatus === 'succeeded' ? (
                <div className="text-center">
                  <svg className="mx-auto w-10 h-10 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-emerald-700">Application Submitted!</p>
                  <Link to="/candidate/applications" className="mt-3 inline-block text-xs text-blue-600 hover:underline">
                    View My Applications →
                  </Link>
                </div>
              ) : isCandidate ? (
                <>
                  {!showApplyForm ? (
                    <>
                      <p className="text-sm text-slate-500 mb-4">Ready to apply? Submit your profile now.</p>
                      <button
                        onClick={() => setShowApplyForm(true)}
                        className="block w-full py-2.5 text-center bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply Now
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-3">
                      <label className="block text-xs text-slate-500 font-medium">Cover Letter (optional)</label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={4}
                        maxLength={2000}
                        placeholder="Tell the recruiter why you're a great fit..."
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                      {submitError && <p className="text-xs text-red-600">{submitError}</p>}
                      <button
                        type="submit"
                        disabled={submitStatus === 'loading'}
                        className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                      >
                        {submitStatus === 'loading' ? 'Submitting…' : 'Submit Application'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowApplyForm(false); dispatch(clearSubmitState()); }}
                        className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-500 mb-4">Sign in as a candidate to apply for this job.</p>
                  <Link to="/login" className="block w-full py-2.5 text-center bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Sign in to Apply
                  </Link>
                  <Link to="/register" className="block w-full py-2 text-center mt-2 text-blue-600 text-sm font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {/* Company Card */}
            {company && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">About the Company</h2>
                <p className="text-sm font-medium text-blue-600 mb-2">{company.companyName}</p>
                {company.description && (
                  <p className="text-sm text-slate-500 line-clamp-4">{company.description}</p>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs text-blue-500 hover:underline">
                    Visit Website →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
