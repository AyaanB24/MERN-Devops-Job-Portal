import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Footer — 4-column footer with brand and links
// ─────────────────────────────────────────────────────────────────────────────

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.887.356-5.79.007-8.525-1.031a19.838 19.838 0 01-5.989-3.546 19.838 19.838 0 01-3.546-5.989 19.838 19.838 0 01-1.031-8.525C.96 3.354 1.902 2.567 2.996 2.567h4.25c.96 0 1.773.68 1.965 1.621.226 1.114.643 2.18 1.234 3.153a2 2 0 01-.455 2.583l-1.27 1.27a16.05 16.05 0 006.018 6.018l1.27-1.27a2 2 0 012.583-.455c.973.591 2.039 1.008 3.153 1.234.941.192 1.621 1.005 1.621 1.965z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900">JobPortal</span>
            </div>
            <p className="text-sm text-slate-500">Connecting talent with opportunity.</p>
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Job Seekers</h3>
            <ul className="space-y-2">
              <li><Link to="/jobs" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Browse Jobs</Link></li>
              <li><Link to="/register" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Create Account</Link></li>
              <li><Link to="/login" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Employers</h3>
            <ul className="space-y-2">
              <li><Link to="/register?role=recruiter" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Post a Job</Link></li>
              <li><Link to="/register" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">For Recruiters</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} JobPortal. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/jobs" className="text-sm text-slate-400 hover:text-blue-600 transition-colors">Browse Jobs</Link>
            <Link to="/register" className="text-sm text-slate-400 hover:text-blue-600 transition-colors">Sign Up</Link>
            <Link to="/login" className="text-sm text-slate-400 hover:text-blue-600 transition-colors">Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
