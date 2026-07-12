import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  register,
  clearError,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
  selectUserRole,
} from './authSlice';

const ROLE_DASHBOARD = {
  candidate: '/candidate/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate', // default role
  });

  // Redirect on successful registration
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(ROLE_DASHBOARD[role] || '/', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  // Clear stale errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password, role: selectedRole } = formData;
    if (!name || !email || !password) return;
    dispatch(register({ name, email, password, role: selectedRole }));
  };

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-sm text-gray-500">Join the Job Portal today</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Role Selector — controls which dashboard the user lands on */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              I am a…
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="candidate">Job Seeker (Candidate)</option>
              <option value="recruiter">Hiring Manager (Recruiter)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
