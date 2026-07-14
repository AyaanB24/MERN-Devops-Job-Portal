import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkIcon, FileText, CheckCircle, Clock, XCircle, Briefcase } from 'lucide-react'
import { useJobStore } from '../store/jobStore'
import { useAuthStore } from '../store/authStore'

export default function CandidateDashboard() {
  const { applications, isLoading, fetchApplications } = useJobStore()
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ total: 0, accepted: 0, pending: 0, rejected: 0 })

  useEffect(() => {
    loadApplications()
  }, [])

  useEffect(() => {
    if (applications.length > 0) {
      const accepted = applications.filter(app => app.status === 'accepted').length
      const rejected = applications.filter(app => app.status === 'rejected').length
      const pending = applications.filter(app => app.status === 'pending').length
      
      setStats({
        total: applications.length,
        accepted,
        rejected,
        pending
      })
    }
  }, [applications])

  const loadApplications = async () => {
    try {
      await fetchApplications();
    } catch (error) {
      // Silently fail - error is handled in store
      console.log('Applications loaded with default empty state');
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle size={20} className="text-green-600" />
      case 'rejected':
        return <XCircle size={20} className="text-red-600" />
      default:
        return <Clock size={20} className="text-yellow-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your job applications and opportunities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
              </div>
              <Briefcase size={32} className="text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <Clock size={32} className="text-yellow-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Accepted</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
              </div>
              <CheckCircle size={32} className="text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              </div>
              <XCircle size={32} className="text-red-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Applications</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">
                <Briefcase size={32} className="text-gray-400" />
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading applications...</p>
            </div>
          ) : applications.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {applications.map((app) => (
                <div key={app._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {app.job?.title || 'Job Title'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Applied on {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="capitalize">{app.status}</span>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                      {app.coverLetter}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <FileText size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start applying for jobs to track your progress here
              </p>
              <Link to="/jobs" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Browse Jobs
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
