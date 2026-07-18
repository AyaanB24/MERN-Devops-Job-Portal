import React, { useState, useEffect } from 'react'
import { X, Loader, AlertCircle } from 'lucide-react'
import { useJobStore } from '../store/jobStore'

export default function CompanyFormModal({ company, onClose }) {
  const { createCompany, updateCompany, isLoading } = useJobStore()
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        description: company.description || '',
        website: company.website || ''
      })
    }
  }, [company])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.companyName?.trim()) {
      setError('Company name is required')
      return
    }

    if (formData.companyName.trim().length < 2) {
      setError('Company name must be at least 2 characters')
      return
    }

    if (!formData.description?.trim()) {
      setError('Description is required')
      return
    }

    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters')
      return
    }

    if (formData.website && !isValidUrl(formData.website)) {
      setError('Please provide a valid website URL (e.g., https://example.com)')
      return
    }

    try {
      const dataToSend = {
        companyName: formData.companyName.trim(),
        description: formData.description.trim(),
        website: formData.website.trim() || ''
      }

      if (company) {
        await updateCompany(company._id, dataToSend)
        alert('Company updated successfully')
      } else {
        await createCompany(dataToSend)
        alert('Company created successfully')
      }
      onClose()
    } catch (error) {
      console.error('Error:', error.response?.data || error.message)
      const errorMessage = error.response?.data?.message || 'Failed to save company'
      setError(errorMessage)
      
      // If the error is about already having a company, provide helpful instruction
      if (errorMessage.includes('already have a company')) {
        setError(errorMessage + '. Delete your existing company to create a new one.')
      }
    }
  }

  const isValidUrl = (url) => {
    if (!url) return true
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {company ? 'Edit Company' : 'Add Company'}
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

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Tech Innovators Inc."
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
              placeholder="Tell us about your company..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website (Optional)
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  {company ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                company ? 'Update Company' : 'Create Company'
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
