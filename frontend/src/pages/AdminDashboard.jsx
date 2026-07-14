import React, { useEffect, useState } from 'react'
import { Users, Briefcase, Building2, TrendingUp } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Platform overview and statistics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalUsers}</p>
              </div>
              <Users size={32} className="text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalJobs}</p>
              </div>
              <Briefcase size={32} className="text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Companies</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalCompanies}</p>
              </div>
              <Building2 size={32} className="text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Applications</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalApplications}</p>
              </div>
              <TrendingUp size={32} className="text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-4">Admin Features</h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            <li>• View platform analytics and statistics</li>
            <li>• Monitor user accounts and activities</li>
            <li>• Manage job postings and applications</li>
            <li>• Enforce platform policies and guidelines</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
