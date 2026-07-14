import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Trash2, Loader, MapPin, DollarSign, Briefcase } from 'lucide-react'
import { useJobStore } from '../store/jobStore'
import { useAuthStore } from '../store/authStore'
import JobFormModal from '../components/JobFormModal'

export default function ManageJobsPage() {
  const { jobs, isLoading, fetchJobs, deleteJob } = useJobStore()
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      await fetchJobs(1, user?.id)
    } catch (error) {
      console.error('Failed to load jobs')
    }
  }

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId)
        alert('Job deleted successfully')
      } catch (error) {
        alert('Failed to delete job')
      }
    }
  }

  const handleEdit = (job) => {
    setEditingJob(job)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingJob(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Jobs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create, edit, and manage your job postings
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            <Plus size={20} />
            Post a Job
          </button>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size={40} className="animate-spin text-blue-600" />
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {job.location && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                          <MapPin size={16} className="text-blue-600" />
                          {job.location}
                        </div>
                      )}
                      {job.jobType && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                          <Briefcase size={16} className="text-blue-600" />
                          {job.jobType}
                        </div>
                      )}
                      {job.salary && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm">
                          <DollarSign size={16} className="text-blue-600" />
                          ${job.salary?.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="flex gap-3">
                  <Link
                    to={`/recruiter/job/${job._id}/applications`}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
                  >
                    View Applications
                  </Link>
                  <button
                    onClick={() => handleEdit(job)}
                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="px-4 py-2 border-2 border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No jobs posted yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by posting your first job to attract candidates
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Post a Job
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && <JobFormModal job={editingJob} onClose={handleCloseForm} />}
    </div>
  )
}
