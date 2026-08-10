import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, User, Loader } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function OAuthRoleSelectionPage() {
  const navigate = useNavigate()
  const { isLoading } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState(null)
  const [oauthData, setOauthData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get OAuth data from sessionStorage
    const data = sessionStorage.getItem('oauthData')
    if (!data) {
      setError('Session expired. Please try logging in again.')
      setTimeout(() => navigate('/login'), 2000)
      return
    }
    
    try {
      const parsedData = JSON.parse(data)
      setOauthData(parsedData)
    } catch (err) {
      setError('Invalid session. Please try logging in again.')
      setTimeout(() => navigate('/login'), 2000)
    }
  }, [navigate])

  const handleRoleSelection = async (role) => {
    setSelectedRole(role)

    if (!oauthData) {
      setError('Session expired. Please try logging in again.')
      return
    }

    try {
      // Update user role in backend
      const response = await fetch(
        '/api/auth/update-oauth-role',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthData.token}`
          },
          body: JSON.stringify({ role })
        }
      )

      const data = await response.json()

      if (data.success) {
        // Store token and user
        localStorage.setItem('token', oauthData.token)
        useAuthStore.setState({
          token: oauthData.token,
          user: data.data.user || oauthData.user,
          isLoading: false
        })

        // Clear session storage
        sessionStorage.removeItem('oauthData')

        // Redirect based on role
        if (role === 'recruiter') {
          navigate('/recruiter/dashboard')
        } else {
          navigate('/candidate/dashboard')
        }
      } else {
        setError(data.message || 'Failed to set role')
      }
    } catch (err) {
      setError(err.message || 'Failed to set role')
    } finally {
      setSelectedRole(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-lg">JP</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Choose Your Role</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome! Let us know how you'll be using JobPortal
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-4 mb-8">
            {/* Candidate Option */}
            <button
              onClick={() => handleRoleSelection('candidate')}
              disabled={selectedRole !== null || isLoading}
              className={`w-full p-6 rounded-lg border-2 transition-all ${
                selectedRole === 'candidate'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              } disabled:opacity-50`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <User size={28} className="text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Job Seeker
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Browse jobs, apply to positions, and manage your applications
                  </p>
                  {selectedRole === 'candidate' && (
                    <div className="mt-2 flex items-center gap-2 text-blue-600">
                      <Loader size={16} className="animate-spin" />
                      <span className="text-sm font-medium">Setting up...</span>
                    </div>
                  )}
                </div>
              </div>
            </button>

            {/* Recruiter Option */}
            <button
              onClick={() => handleRoleSelection('recruiter')}
              disabled={selectedRole !== null || isLoading}
              className={`w-full p-6 rounded-lg border-2 transition-all ${
                selectedRole === 'recruiter'
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
              } disabled:opacity-50`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  <Briefcase size={28} className="text-purple-600" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recruiter
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Post jobs, review applications, and manage your companies
                  </p>
                  {selectedRole === 'recruiter' && (
                    <div className="mt-2 flex items-center gap-2 text-purple-600">
                      <Loader size={16} className="animate-spin" />
                      <span className="text-sm font-medium">Setting up...</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              ℹ️ You can change your role later in your profile settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
