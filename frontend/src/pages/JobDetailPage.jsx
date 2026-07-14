import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, DollarSign, Calendar, ArrowLeft, Loader, Send } from 'lucide-react'
import { useJobStore } from '../store/jobStore'
import { useAuthStore } from '../store/authStore'

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
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
    } catch (error) {
      console.error('Failed to fetch job')
    } finally {
      setLoading(false)
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
      navigate('/candidate/dashboard')
    } catch (error) {
      alert('Failed to submit application')
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
            {isAuthenticated() && isCandidate() && (
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

        {/* Apply Form */}
        {showApplyForm && isAuthenticated() && isCandidate() && (
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
