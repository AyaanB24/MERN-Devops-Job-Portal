import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, DollarSign, Calendar, ArrowLeft, Loader, Send, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useJobStore } from '../store/jobStore'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', label: 'Pending' },
  accepted: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', label: 'Accepted' },
  rejected: { icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', label: 'Rejected' },
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [applying, setApplying] = useState(false)
  const { fetchJobById, applyForJob } = useJobStore()
  const { isAuthenticated, isCandidate, user } = useAuthStore()

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const jobData = await fetchJobById(id)
      setJob(jobData)
      
      // If candidate is logged in, check if they already applied
      if (isAuthenticated() && isCandidate() && user?.id) {
        await fetchCandidateApplication()
      }
    } catch (error) {
      console.error('Failed to fetch job')
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidateApplication = async () => {
    try {
      const response = await axios.get(`/api/applications?job=${id}`)
      const applications = response.data.data || []
      
      // Find application by current candidate - handle both object and string IDs
      const candidateId = user?.id
      const candidateApp = applications.find(app => {
        const appCandidateId = typeof app.candidate === 'object' ? app.candidate?._id : app.candidate
        return appCandidateId === candidateId
      })
      
      if (candidateApp) {
        console.log('Found candidate application:', candidateApp)
        setApplication(candidateApp)
      }
    } catch (error) {
      // Application not found or error fetching - that's ok
      console.log('No application found for this job:', error.message)
    }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    if (!coverLetter.trim()) {
      alert('Please write a cover letter')
      return
    }

    setApplying(true)
    try {
      await applyForJob(id, coverLetter)
      alert('Application submitted successfully!')
      setCoverLetter('')
      setShowApplyForm(false)
      // Refetch application details
      await fetchCandidateApplication()
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to submit application'
      alert(errorMsg)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8"
          >
            <ArrowLeft size={20} />
            Back to Jobs
          </button>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Jobs
        </button>

        {/* Application Status Banner (if candidate has applied) */}
        {application && (
          <div className={`rounded-lg shadow-md p-6 mb-8 border-2 ${statusConfig[application.status].bgColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {React.createElement(statusConfig[application.status].icon, {
                  size: 28,
                  className: statusConfig[application.status].color
                })}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Application Status: {statusConfig[application.status].label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {job.title}
              </h1>
              <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
                {job.company?.companyName || 'Company Name'}
              </p>
            </div>
            {isAuthenticated() && isCandidate() && !application && (
              <button
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Send size={20} />
                Apply Now
              </button>
            )}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            {job.location && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <MapPin size={18} className="text-blue-600" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">{job.location}</p>
              </div>
            )}
            {job.jobType && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Briefcase size={18} className="text-blue-600" />
                  <span className="text-sm font-medium">Type</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">{job.jobType}</p>
              </div>
            )}
            {job.salary && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <DollarSign size={18} className="text-blue-600" />
                  <span className="text-sm font-medium">Salary</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">${job.salary?.toLocaleString()}</p>
              </div>
            )}
            {job.experience && (
              <div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Calendar size={18} className="text-blue-600" />
                  <span className="text-sm font-medium">Experience</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">{job.experience}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About this job</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>

        {/* Company Info */}
        {job.company && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About the company</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{job.company.description}</p>
            {job.company.website && (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Visit Company Website →
              </a>
            )}
          </div>
        )}

        {/* Application Details (if applied) - MOVED UP after status banner */}
        {application && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-lg p-8 mb-8 border-2 border-blue-200 dark:border-blue-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText size={28} className="text-blue-600" />
              Your Application Details
            </h2>
            
            <div className="space-y-6">
              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                  📝 Cover Letter
                </label>
                <div className="p-5 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {application.coverLetter || 'No cover letter provided'}
                  </p>
                </div>
              </div>

              {/* Application Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-2 border-blue-200 dark:border-blue-700">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold uppercase">Applied on</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(application.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold uppercase">Current Status</p>
                  <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusConfig[application.status].bgColor} ${statusConfig[application.status].color} flex items-center gap-2`}>
                    {React.createElement(statusConfig[application.status].icon, { size: 20 })}
                    {statusConfig[application.status].label}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold uppercase">Application ID</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                    {application._id?.slice(0, 12)}...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Apply Form */}
        {showApplyForm && isAuthenticated() && isCandidate() && !application && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Submit Your Application</h2>
            
            <form onSubmit={handleApply} className="space-y-6">
              {/* Name (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white opacity-50 cursor-not-allowed"
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white opacity-50 cursor-not-allowed"
                />
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Letter
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell us why you're interested in this position..."
                  rows={6}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Application
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
