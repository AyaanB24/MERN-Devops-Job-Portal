import { useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectUserRole,
  selectAuthStatus,
} from '../features/auth/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// useAuth — convenience hook wrapping auth selectors
// ─────────────────────────────────────────────────────────────────────────────

const useAuth = () => {
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const status = useSelector(selectAuthStatus);

  return {
    user,
    isAuthenticated,
    role,
    status,
    isLoading: status === 'loading',
    isCandidate: role === 'candidate',
    isRecruiter: role === 'recruiter',
    isAdmin: role === 'admin',
  };
};

export default useAuth;
