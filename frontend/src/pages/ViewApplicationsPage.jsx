import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader, CheckCircle, XCircle, Clock, User } from 'lucide-react'
import { useJobStore } from '../store/jobStore'

export default function ViewApplicationsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { applications, isLoading, fetchApplicationsByJob, updateApplicationStatus } = useJobStore()
  const [job, setJob] = useState(null)

  useEffect(() => {
    loadApplications()
  }, [id])

  const loadApplications = async () => {
    try {
      await fetchApplicationsByJob(id)
    } catch (error) {
      console.error('Failed to load applications')
    }
  }

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus)
      alert(`Application ${newStatus} successfully`)
    } catch (error) {
      alert('Failed to update application status')
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
        {/* Back Button */}
        <button
          onClick={() => navigate('/recruiter/manage-jobs')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </button>

        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Job Applications
        </h1>

        {/* Applications List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size={40} className="animate-spin text-blue-600" />
          </div>
        ) : applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {app.candidate?.name || 'Candidate Name'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {app.candidate?.email}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)}
                    <span className="capitalize">{app.status}</span>
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cover Letter:</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
                      {app.coverLetter}
                    </p>
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleStatusChange(app._id, 'accepted')}
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(app._id, 'rejected')}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    to={`/candidate/${app.candidate?._id || app.candidate}/profile`}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <User size={18} />
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Loader size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Applications will appear here as candidates apply
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
