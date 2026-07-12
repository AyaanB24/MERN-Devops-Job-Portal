import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../features/auth/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// HomePage — Public marketing landing page.
// No API calls — navigates to /jobs which owns the job data fetch.
// CTA buttons are role-aware: logged-in users go to their dashboard.
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_DASHBOARD = {
  candidate: '/candidate/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

const FEATURES = [
  { icon: '🔍', title: 'Smart Job Search', desc: 'Filter by role, location, type, and experience level.' },
  { icon: '🏢', title: 'Verified Companies', desc: 'Every recruiter verifies their company before posting.' },
  { icon: '📄', title: 'One-Click Apply', desc: 'Apply instantly using your saved profile and resume.' },
  { icon: '📊', title: 'Track Applications', desc: 'See real-time status updates on every application.' },
];

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  const ctaPath = isAuthenticated ? (ROLE_DASHBOARD[role] || '/jobs') : '/jobs';
  const ctaLabel = isAuthenticated ? 'Go to Dashboard' : 'Browse Jobs';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">
            JobPortal
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/jobs" className="text-sm text-gray-600 hover:text-indigo-600 transition font-medium">
              Browse Jobs
            </Link>
            {isAuthenticated ? (
              <Link
                to={ROLE_DASHBOARD[role] || '/'}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition">
                  Sign in
                </Link>
                <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur">
            🚀 Production-Grade Job Portal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Find Your Next
            <br />
            <span className="text-yellow-300">Dream Job</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto">
            Connect with top companies. Apply with one click. Track every application — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ctaPath}
              className="px-8 py-3.5 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition shadow-lg"
            >
              {ctaLabel}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register?role=recruiter"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold text-sm rounded-xl hover:bg-white/20 transition backdrop-blur"
              >
                Post a Job →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Jobs Posted', value: '500+' },
            { label: 'Companies', value: '120+' },
            { label: 'Candidates', value: '2,000+' },
            { label: 'Placements', value: '300+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-indigo-600">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Everything you need</h2>
          <p className="mt-3 text-gray-500 text-sm">Built for candidates and recruiters alike.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <span className="text-3xl">{icon}</span>
              <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="bg-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-3 text-indigo-200 text-sm">Create your free account in under a minute.</p>
            <Link
              to="/register"
              className="mt-8 inline-block px-8 py-3.5 bg-white text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-50 transition shadow-lg"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>© {new Date().getFullYear()} JobPortal. All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/jobs" className="hover:text-indigo-600 transition">Browse Jobs</Link>
            <Link to="/register" className="hover:text-indigo-600 transition">Sign Up</Link>
            <Link to="/login" className="hover:text-indigo-600 transition">Login</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
