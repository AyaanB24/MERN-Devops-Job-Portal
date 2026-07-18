import React, { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Loader, Globe } from 'lucide-react'
import { useJobStore } from '../store/jobStore'
import CompanyFormModal from '../components/CompanyFormModal'

export default function ManageCompaniesPage() {
  const { companies, isLoading, fetchCompanies, deleteCompany } = useJobStore()
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState(null)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      await fetchCompanies()
    } catch (error) {
      console.error('Failed to load companies')
    }
  }

  const handleDelete = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany(companyId)
        alert('Company deleted successfully')
      } catch (error) {
        alert('Failed to delete company')
      }
    }
  }

  const handleEdit = (company) => {
    setEditingCompany(company)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCompany(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Companies
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {companies.length > 0 
                ? 'You can have only one company. Edit or delete to manage.' 
                : 'Create your company profile to post jobs'}
            </p>
          </div>
          {companies.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              <Plus size={20} />
              Add Company
            </button>
          )}
        </div>

        {/* 1-Company Limit Notice */}
        {companies.length > 0 && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-900 dark:text-blue-100 font-semibold">
              📌 One Company Per Recruiter
            </p>
            <p className="text-blue-700 dark:text-blue-200 text-sm mt-1">
              You are limited to managing one company. You can edit or delete this company, but cannot create additional ones. To create a new company, delete the existing one first.
            </p>
          </div>
        )}

        {/* Companies Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader size={40} className="animate-spin text-blue-600" />
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div
                key={company._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {company.companyName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {company.companyName}
                  </h3>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {company.description}
                </p>

                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4"
                  >
                    <Globe size={16} />
                    Visit Website
                  </a>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="flex-1 px-3 py-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company._id)}
                    className="flex-1 px-3 py-2 border-2 border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <Globe size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No companies yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first company profile to post jobs
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Add Company
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && <CompanyFormModal company={editingCompany} onClose={handleCloseForm} />}
    </div>
  )
}
