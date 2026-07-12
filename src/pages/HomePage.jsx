import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from '../features/auth/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// HomePage — Public marketing landing page (content only).
// Navbar and Footer are provided by PublicLayout.
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_DASHBOARD = {
  candidate: '/candidate/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

const FEATURES = [
  { icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z', title: 'Smart Job Search', desc: 'Filter by role, location, type, and experience level.' },
  { icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-6.75 3H21m-6.75 3H21', title: 'Verified Companies', desc: 'Every recruiter verifies their company before posting.' },
  { icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z', title: 'One-Click Apply', desc: 'Apply instantly using your saved profile and resume.' },
  { icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z', title: 'Track Applications', desc: 'See real-time status updates on every application.' },
];

const HomePage = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  const ctaPath = isAuthenticated ? (ROLE_DASHBOARD[role] || '/jobs') : '/jobs';
  const ctaLabel = isAuthenticated ? 'Go to Dashboard' : 'Browse Jobs';

  return (
    <>
      {/* Hero */}
      <section className="relative bg-blue-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="inline-block bg-white/10 border border-white/20 text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur">
            Production-Grade Job Portal
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Find Your Next
            <br />
            <span className="text-blue-200">Dream Job</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Connect with top companies. Apply with one click. Track every application — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ctaPath}
              className="px-8 py-3.5 bg-white text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              {ctaLabel}
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register?role=recruiter"
                className="px-8 py-3.5 bg-white/10 border border-white/30 text-white font-semibold text-sm rounded-xl hover:bg-white/20 transition-colors backdrop-blur"
              >
                Post a Job →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { label: 'Jobs Posted', value: '500+' },
            { label: 'Companies', value: '120+' },
            { label: 'Candidates', value: '2,000+' },
            { label: 'Placements', value: '300+' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl font-bold text-blue-600">{value}</p>
              <p className="text-sm text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need</h2>
          <p className="mt-3 text-slate-500 text-sm">Built for candidates and recruiters alike.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      {!isAuthenticated && (
        <section className="bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="mt-3 text-blue-200 text-sm">Create your free account in under a minute.</p>
            <Link
              to="/register"
              className="mt-8 inline-block px-8 py-3.5 bg-white text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default HomePage;
