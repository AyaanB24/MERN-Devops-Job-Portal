import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSlice';
import Avatar from '../ui/Avatar';

// ─────────────────────────────────────────────────────────────────────────────
// TopHeader — Dashboard top bar with mobile menu toggle, page title, user avatar
// ─────────────────────────────────────────────────────────────────────────────

const TopHeader = ({ onMenuClick, title }) => {
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectUserRole);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      {/* Left: mobile toggle + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      {/* Right: browse jobs + user */}
      <div className="flex items-center gap-4">
        <Link to="/jobs" className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
          Browse Jobs
        </Link>
        <div className="flex items-center gap-2">
          <Avatar name={user?.name} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
