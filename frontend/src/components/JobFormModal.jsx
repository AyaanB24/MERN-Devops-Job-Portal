import React, { useState, useEffect } from 'react'
import { X, Loader, AlertCircle } from 'lucide-react'
import { useJobStore } from '../store/jobStore'

export default function JobFormModal({ job, onClose }) {
  const { companies, createJob, updateJob, isLoading } = useJobStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    jobType: 'Full-time',
    experience: '1-3 years',
    skills: '',
    company: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        salary: job.salary || '',
        jobType: job.jobType || 'Full-time',
        experience: job.experience || '1-3 years',
        skills: job.skills?.join(', ') || '',
        company: job.company?._id || ''
      })
    } else if (companies.length > 0) {
      // Auto-select first company when creating new job
      setFormData(prev => ({ ...prev, company: companies[0]._id }))
    }
  }, [job, companies])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('=== JOB FORM SUBMITTED ===');
    console.log('Form data:', formData);
    console.log('Is loading:', isLoading);
    console.log('Companies available:', companies.length);
    
    // Validation
    if (!formData.company) {
      setError('Please select a company')
      console.log('Error: No company selected');
      return
    }

    if (!formData.title?.trim()) {
      setError('Job title is required')
      console.log('Error: No title');
      return
    }

    if (!formData.description?.trim() || formData.description.length < 10) {
      setError('Description must be at least 10 characters')
      console.log('Error: Invalid description');
      return
    }

    if (!formData.location?.trim()) {
      setError('Location is required')
      console.log('Error: No location');
      return
    }

    if (!formData.salary || parseInt(formData.salary) < 0) {
      setError('Valid salary is required')
      console.log('Error: Invalid salary');
      return
    }

    if (!formData.experience) {
      setError('Experience level is required')
      console.log('Error: No experience');
      return
    }

    try {
      const dataToSend = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        salary: parseInt(formData.salary),
        jobType: formData.jobType,
        experience: formData.experience,
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        company: formData.company
      }

      console.log('Submitting job data:', dataToSend);

      if (job) {
        console.log('Updating existing job:', job._id);
        await updateJob(job._id, dataToSend)
        alert('Job updated successfully')
      } else {
        console.log('Creating new job');
        await createJob(dataToSend)
        alert('Job posted successfully')
      }
      onClose()
    } catch (error) {
      console.error('Error submitting form:', error);
      // Check if it's a validation error with field details
      const errors = error.response?.data?.errors;
      if (errors && errors.length > 0) {
        const fieldError = errors[0];
        const errorMessage = `${fieldError.field}: ${fieldError.message}`;
        setError(errorMessage);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save job';
        setError(errorMessage);
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {job ? 'Edit Job' : 'Post a New Job'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* No Companies Warning */}
          {companies.length === 0 && (
            <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-yellow-700 dark:text-yellow-300 font-medium">No companies found</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm">Create a company first before posting jobs</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Frontend Developer"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the job role, responsibilities, and requirements..."
              rows={5}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company *
            </label>
            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={companies.length === 0}
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., New York, Remote"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Salary (Annual) *
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g., 120000"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Type *
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Experience *
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select experience level</option>
              <option value="0-1 years">0-1 years</option>
              <option value="1-3 years">1-3 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5-10 years">5-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, MongoDB"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || companies.length === 0}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:bg-blue-800"
              onSubmit={handleSubmit}
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  {job ? 'Updating...' : 'Posting...'}
                </>
              ) : (
                job ? 'Update Job' : 'Post Job'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
