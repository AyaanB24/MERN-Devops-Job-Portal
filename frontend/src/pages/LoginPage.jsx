import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Loader } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await login(email, password)
      console.log('Login response:', response)
      console.log('Response data:', response.data)
      console.log('User object:', response.data?.user)
      console.log('User role:', response.data?.user?.role)
      
      // Get role from the response data.user object
      const role = response.data?.user?.role
      
      console.log('Role extracted for redirect:', role)
      
      // Redirect based on role
      if (role === 'recruiter') {
        console.log('✓ Redirecting to recruiter dashboard');
        navigate('/recruiter/dashboard')
      } else if (role === 'candidate') {
        console.log('✓ Redirecting to candidate dashboard');
        navigate('/candidate/dashboard')
      } else if (role === 'admin') {
        console.log('✓ Redirecting to admin dashboard');
        navigate('/admin/dashboard')
      } else {
        console.log('⚠ No role found, redirecting to home');
        navigate('/')
      }
    } catch (err) {
      console.error('Login failed', err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-lg">JP</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Welcome back to JobPortal</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Candidate:</strong> alex.candidate@example.com</p>
            <p><strong>Recruiter:</strong> sarah.recruiter@example.com</p>
            <p><strong>Password:</strong> securepassword123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
