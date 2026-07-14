import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Briefcase, Building2, Plus, TrendingUp } from 'lucide-react'
import { useJobStore } from '../store/jobStore'
import { useAuthStore } from '../store/authStore'

export default function RecruiterDashboard() {
  const { jobs, companies, isLoading, fetchJobs, fetchCompanies } = useJobStore()
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ jobs: 0, companies: 0, applications: 0 })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setStats({
      jobs: jobs.length,
      companies: companies.length,
      applications: 0 // This would need to be calculated from all jobs' applications
    })
  }, [jobs, companies])

  const loadData = async () => {
    try {
      const userId = user?.id
      await fetchJobs(1, userId, true) // true = manageMode
      await fetchCompanies()
    } catch (error) {
      console.error('Failed to load data')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your jobs, companies, and applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.jobs}</p>
              </div>
              <Briefcase size={32} className="text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Companies</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.companies}</p>
              </div>
              <Building2 size={32} className="text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.applications}</p>
              </div>
              <Users size={32} className="text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/recruiter/manage-jobs"
            className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Manage Jobs</h3>
                <p className="text-blue-100">View, edit, and delete your job postings</p>
              </div>
              <Briefcase size={40} className="opacity-20" />
            </div>
          </Link>

          <Link
            to="/recruiter/manage-companies"
            className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg shadow-lg p-6 transition-all hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Manage Companies</h3>
                <p className="text-purple-100">Manage your company profile and details</p>
              </div>
              <Building2 size={40} className="opacity-20" />
            </div>
          </Link>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Job Postings</h2>
            <Link to="/recruiter/manage-jobs" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              View All →
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">
                <Briefcase size={32} className="text-gray-400" />
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading jobs...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.slice(0, 5).map((job) => (
                <div key={job._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {job.jobType} • {job.location} • ${job.salary?.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Posted on {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/recruiter/job/${job._id}/applications`}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium"
                    >
                      View Applications
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No jobs posted yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first job posting to get started
              </p>
              <Link to="/recruiter/manage-jobs" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Post a Job
              </Link>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">Getting Started</h3>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <span>Create or manage your company profile</span>
            </li>
            <li className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <span>Post job openings for your positions</span>
            </li>
            <li className="flex items-center gap-3 text-blue-800 dark:text-blue-200">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <span>Review and manage candidate applications</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
