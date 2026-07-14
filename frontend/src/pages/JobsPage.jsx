import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Briefcase, DollarSign, Clock, Loader, ExternalLink } from 'lucide-react'
import { useJobStore } from '../store/jobStore'

export default function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
  })
  const { fetchJobs } = useJobStore()

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const response = await fetchJobs()
      setJobs(response.data || [])
    } catch (error) {
      console.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                          job.description.toLowerCase().includes(filters.search.toLowerCase())
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase())
    const matchesType = !filters.jobType || job.jobType === filters.jobType
    return matchesSearch && matchesLocation && matchesType
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Browse Jobs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find your next opportunity from {jobs.length} available positions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Jobs
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by title, company..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="City or Remote"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Type
            </label>
            <select
              name="jobType"
              value={filters.jobType}
              onChange={handleFilterChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size={40} className="animate-spin text-blue-600" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Link
                key={job._id}
                to={`/job/${job._id}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {job.company?.companyName || 'Company Name'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    {job.jobType}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {job.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {job.location && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                  )}
                  {job.salary && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign size={18} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm">${job.salary?.toLocaleString()}</span>
                    </div>
                  )}
                  {job.experience && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Briefcase size={18} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm">{job.experience}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm">2 days ago</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:gap-2 transition-all">
                    View Details <ExternalLink size={16} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
