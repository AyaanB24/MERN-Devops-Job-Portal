import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, FileText, Calendar, CheckCircle, Clock, XCircle, Briefcase, MapPin, DollarSign } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    label: 'Pending Review',
    description: 'Your application is being reviewed by the hiring team'
  },
  accepted: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-300 dark:border-green-700',
    label: 'Accepted',
    description: 'Congratulations! Your application has been accepted'
  },
  rejected: { 
    icon: XCircle, 
    color: 'text-red-600', 
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-300 dark:border-red-700',
    label: 'Rejected',
    description: 'Unfortunately, your application was not selected'
  },
}

export default function ApplicationDetailPage() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [application, setApplication] = useState(null)
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchApplicationDetails()
  }, [applicationId])

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch application details
      const appResponse = await axios.get(`http://localhost:5000/api/applications`)
      const applications = appResponse.data.data || []
      
      console.log('Applications fetched:', applications.length)
      console.log('Looking for ID:', applicationId)
      
      // Find the specific application
      const foundApp = applications.find(app => app._id === applicationId)
      
      if (!foundApp) {
        console.log('Application not found')
        setError('Application not found')
        setLoading(false)
        return
      }

      console.log('Application found:', foundApp)
      setApplication(foundApp)

      // Fetch job details if we have the job ID
      if (foundApp.job) {
        try {
          const jobId = typeof foundApp.job === 'object' ? foundApp.job._id : foundApp.job
          console.log('Fetching job:', jobId)
          const jobResponse = await axios.get(`http://localhost:5000/api/jobs/${jobId}`)
          setJob(jobResponse.data.data)
          console.log('Job fetched successfully')
        } catch (err) {
          console.log('Could not fetch job details:', err.message)
        }
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error fetching application:', error)
      setError('Failed to load application details: ' + error.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8 font-medium"
          >
            <ArrowLeft size={20} />
            Back to Applications
          </button>
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
              {error || 'Application not found'}
            </h2>
            <button
              onClick={() => navigate('/candidate/dashboard')}
              className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const jobTitle = typeof application.job === 'object' ? application.job.title : job?.title || 'Job Position'
  const jobLocation = job?.location || 'Location not available'
  const jobSalary = job?.salary || 'Salary not specified'

  const StatusIcon = statusConfig[application.status]?.icon || Clock
  const status = statusConfig[application.status] || statusConfig.pending

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/candidate/dashboard')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Applications
        </button>

        {/* Application Header with Status */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 border-2 ${status.bgColor} ${status.borderColor}`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {jobTitle}
              </h1>
              <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-400">
                {jobLocation && (
                  <div className="flex items-center gap-1">
                    <MapPin size={18} className="text-blue-600" />
                    {jobLocation}
                  </div>
                )}
                {jobSalary && (
                  <div className="flex items-center gap-1">
                    <DollarSign size={18} className="text-green-600" />
                    ${jobSalary?.toLocaleString ? jobSalary.toLocaleString() : jobSalary}
                  </div>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-3 px-6 py-3 rounded-lg ${status.bgColor} ${status.borderColor} border-2`}>
              <StatusIcon size={32} className={status.color} />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Application Status</p>
                <p className={`text-2xl font-bold ${status.color}`}>{status.label}</p>
              </div>
            </div>
          </div>

          {/* Status Description */}
          <p className={`text-base font-medium ${status.color}`}>
            {status.description}
          </p>
        </div>

        {/* Timeline Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Calendar size={28} />
            Application Timeline
          </h2>

          <div className="space-y-4">
            {/* Application Submitted */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-2 border-blue-300 dark:border-blue-700">
                  <FileText size={24} className="text-blue-600" />
                </div>
                <div className="w-1 h-12 bg-gray-300 dark:bg-gray-700 mt-2"></div>
              </div>
              <div className="pt-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Application Submitted</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {new Date(application.createdAt).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Your application was received</p>
              </div>
            </div>

            {/* Status Update */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${status.bgColor} ${status.borderColor}`}>
                  <StatusIcon size={24} className={status.color} />
                </div>
              </div>
              <div className="pt-2">
                <h3 className={`text-lg font-bold ${status.color}`}>{status.label}</h3>
                {application.updatedAt && application.updatedAt !== application.createdAt ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(application.updatedAt).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">Awaiting review</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {application.status === 'pending' && 'The hiring team is reviewing your application'}
                  {application.status === 'accepted' && 'Great news! You have been accepted'}
                  {application.status === 'rejected' && 'Thank you for applying. Keep trying!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Your Submission */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText size={28} className="text-blue-600" />
              Your Cover Letter
            </h2>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {application.coverLetter || 'No cover letter was provided with this application'}
              </p>
            </div>
          </div>

          {/* Application Metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Application Details</h2>

            <div className="space-y-4">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">APPLICATION ID</p>
                <p className="font-mono text-gray-900 dark:text-white break-all">{application._id}</p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">SUBMITTED</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {new Date(application.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">LAST UPDATED</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(application.updatedAt || application.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {new Date(application.updatedAt || application.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">STATUS</p>
                <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${status.bgColor} ${status.color} flex items-center gap-2`}>
                  <StatusIcon size={20} />
                  {status.label}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 flex gap-4">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Briefcase size={20} />
            Back to Applications
          </button>
          <button
            onClick={() => navigate('/jobs')}
            className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
          >
            <Briefcase size={20} />
            Browse More Jobs
          </button>
        </div>
      </div>
    </div>
  )
}
