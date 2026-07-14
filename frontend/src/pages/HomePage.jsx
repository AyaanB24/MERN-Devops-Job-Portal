import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Briefcase, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function HomePage() {
  const { isAuthenticated, isCandidate, isRecruiter } = useAuthStore()

  const features = [
    {
      icon: Search,
      title: 'Smart Job Search',
      description: 'Filter by role, location, type, and experience level with advanced filters.'
    },
    {
      icon: Users,
      title: 'Verified Companies',
      description: 'Connect with verified recruiters and top companies in your field.'
    },
    {
      icon: Briefcase,
      title: 'One-Click Apply',
      description: 'Apply instantly using your saved profile and resume.'
    },
    {
      icon: TrendingUp,
      title: 'Track Applications',
      description: 'See real-time status updates on every application you submit.'
    },
  ]

  const stats = [
    { value: '500+', label: 'Jobs Posted' },
    { value: '120+', label: 'Companies' },
    { value: '2,000+', label: 'Candidates' },
    { value: '300+', label: 'Placements' },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-900 dark:to-gray-950 text-white overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur border border-white/20 rounded-full">
            <span className="text-sm font-medium">✨ Your Gateway to Amazing Career Opportunities</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Find Your Next
            <span className="block bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
              Dream Job
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Connect with top companies. Apply with one click. Track every application — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs" className="px-8 py-3.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
              Browse Jobs
            </Link>
            {!isAuthenticated() && (
              <Link to="/register?role=recruiter" className="px-8 py-3.5 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                Post a Job <ArrowRight className="inline ml-2" size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="group">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Built for candidates and recruiters alike
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-2xl transition-shadow border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated() && (
        <section className="bg-blue-600 dark:bg-blue-900 text-white py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of professionals finding their dream jobs
            </p>
            <Link to="/register" className="inline-block px-8 py-3.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg">
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
