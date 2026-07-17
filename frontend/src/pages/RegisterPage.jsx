import React, { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { User, Mail, Lock, Briefcase, Loader } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import GoogleLoginButton from '../components/GoogleLoginButton'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate'
  })
  const [searchParams] = useSearchParams()
  const { register, isLoading, error } = useAuthStore()
  const navigate = useNavigate()

  // Set role from URL params if available
  React.useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'recruiter' || roleParam === 'candidate') {
      setFormData(prev => ({ ...prev, role: roleParam }))
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      console.log('Starting registration with role:', formData.role);
      
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      
      console.log('Register response:', response);
      console.log('Response data:', response.data);
      console.log('User object:', response.data?.user);
      console.log('User role:', response.data?.user?.role);
      
      // Get role from the response data.user object
      const role = response.data?.user?.role;
      
      console.log('Role extracted for redirect:', role);
      
      // Redirect based on role
      if (role === 'recruiter') {
        console.log('✓ Redirecting to recruiter dashboard');
        navigate('/recruiter/dashboard');
      } else if (role === 'candidate') {
        console.log('✓ Redirecting to candidate dashboard');
        navigate('/candidate/dashboard');
      } else if (role === 'admin') {
        console.log('✓ Redirecting to admin dashboard');
        navigate('/admin/dashboard');
      } else {
        console.log('⚠ No role found, redirecting to home');
        navigate('/');
      }
    } catch (err) {
      console.error('Registration failed:', err);
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join JobPortal today</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I am a...
              </label>
              <div className="flex gap-3">
                {['candidate', 'recruiter'].map(role => (
                  <label key={role} className="flex items-center flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={formData.role === role}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {role === 'candidate' ? '👤 Job Seeker' : '💼 Recruiter'}
                    </span>
                  </label>
                ))}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
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
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
          </div>

          {/* Google Sign-Up */}
          <GoogleLoginButton
            role={formData.role}
            onSuccess={(data) => {
              // Store token and user
              localStorage.setItem('token', data.token)
              useAuthStore.setState({ 
                token: data.token, 
                user: data.user,
                isLoading: false 
              })
              
              // Redirect based on role
              if (data.user?.role === 'recruiter') {
                navigate('/recruiter/dashboard')
              } else {
                navigate('/candidate/dashboard')
              }
            }}
            onError={(error) => {
              alert('Google Sign-Up failed: ' + error)
            }}
            isLoading={isLoading}
          />

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
