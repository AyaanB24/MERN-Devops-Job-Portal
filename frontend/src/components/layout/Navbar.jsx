import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser, selectIsAuthenticated, selectUserRole } from '../../features/auth/authSlice';
import { ROLE_DASHBOARD } from '../../config/constants';
import Avatar from '../ui/Avatar';

// ─────────────────────────────────────────────────────────────────────────────
// Navbar — Public navbar with logo, links, auth-aware menu
// ─────────────────────────────────────────────────────────────────────────────

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectUserRole);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.887.356-5.79.007-8.525-1.031a19.838 19.838 0 01-5.989-3.546 19.838 19.838 0 01-3.546-5.989 19.838 19.838 0 01-1.031-8.525C.96 3.354 1.902 2.567 2.996 2.567h4.25c.96 0 1.773.68 1.965 1.621.226 1.114.643 2.18 1.234 3.153a2 2 0 01-.455 2.583l-1.27 1.27a16.05 16.05 0 006.018 6.018l1.27-1.27a2 2 0 012.583-.455c.973.591 2.039 1.008 3.153 1.234.941.192 1.621 1.005 1.621 1.965z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">JobPortal</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Browse Jobs
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:bg-slate-50 rounded-lg p-1 transition-colors"
                >
                  <Avatar name={user?.name} size="sm" />
                  <span className="text-sm font-medium text-slate-700">{user?.name?.split(' ')[0]}</span>
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2" onClick={() => setUserMenuOpen(false)}>
                    <Link to={ROLE_DASHBOARD[role] || '/'} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white py-4 px-4 space-y-3">
          <Link to="/jobs" className="block text-sm font-medium text-slate-600 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
            Browse Jobs
          </Link>
          {isAuthenticated ? (
            <>
              <Link to={ROLE_DASHBOARD[role] || '/'} className="block text-sm font-medium text-slate-600 hover:text-blue-600" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button onClick={handleLogout} className="block text-sm font-medium text-red-600">
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" className="text-sm font-medium text-slate-700" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link to="/register" className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
