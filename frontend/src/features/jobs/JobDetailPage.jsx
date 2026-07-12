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

// ─────────────────────────────────────────────────────────────────────────────
// JobDetailPage — Public. Fetches a single job by :id URL param.
// Authenticated candidates can apply inline with an optional cover letter.
// ─────────────────────────────────────────────────────────────────────────────

const JOB_TYPE_COLORS = {
  'Full-time': 'bg-green-100 text-green-700',
  'Part-time': 'bg-yellow-100 text-yellow-700',
  Contract: 'bg-blue-100 text-blue-700',
  Internship: 'bg-purple-100 text-purple-700',
  Remote: 'bg-cyan-100 text-cyan-700',
};

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

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <p className="text-gray-600">{error || 'Job not found.'}</p>
        <button
          onClick={() => navigate('/jobs')}
          className="mt-6 px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

  if (!job) return null;

  const {
    title, description, salary, location, experience,
    jobType, skills = [], company, createdAt,
  } = job;

  const badgeClass = JOB_TYPE_COLORS[jobType] || 'bg-gray-100 text-gray-600';
  const postedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Back link */}
        <Link to="/jobs" className="inline-flex items-center text-sm text-indigo-600 hover:underline mb-6">
          ← Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Main Content ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="mt-1 text-gray-500 font-medium">{company?.companyName}</p>
                </div>
                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${badgeClass}`}>
                  {jobType}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-500">
                <span>📍 {location}</span>
                <span>💼 {experience}</span>
                <span>💰 ₹{salary?.toLocaleString('en-IN')}/yr</span>
                <span>🗓 Posted {postedDate}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">Job Description</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{description}</p>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Apply Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              {submitStatus === 'succeeded' ? (
                <div className="text-center">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-sm font-semibold text-green-700">Application Submitted!</p>
                  <Link
                    to="/candidate/applications"
                    className="mt-3 inline-block text-xs text-indigo-600 hover:underline"
                  >
                    View My Applications →
                  </Link>
                </div>
              ) : isCandidate ? (
                <>
                  {!showApplyForm ? (
                    <>
                      <p className="text-sm text-gray-500 mb-4">Ready to apply? Submit your profile now.</p>
                      <button
                        onClick={() => setShowApplyForm(true)}
                        className="block w-full py-2.5 text-center bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                      >
                        Apply Now
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-3">
                      <label className="block text-xs text-gray-500 font-medium">
                        Cover Letter (optional)
                      </label>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={4}
                        maxLength={2000}
                        placeholder="Tell the recruiter why you're a great fit..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      {submitError && (
                        <p className="text-xs text-red-600">{submitError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={submitStatus === 'loading'}
                        className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition"
                      >
                        {submitStatus === 'loading' ? 'Submitting…' : 'Submit Application'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowApplyForm(false); dispatch(clearSubmitState()); }}
                        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">Sign in as a candidate to apply for this job.</p>
                  <Link
                    to="/login"
                    className="block w-full py-2.5 text-center bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
                  >
                    Sign in to Apply
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full py-2 text-center mt-2 text-indigo-600 text-sm font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {/* Company Card */}
            {company && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">About the Company</h2>
                <p className="text-sm font-medium text-indigo-600 mb-2">{company.companyName}</p>
                {company.description && (
                  <p className="text-sm text-gray-500 line-clamp-4">{company.description}</p>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs text-indigo-500 hover:underline"
                  >
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
