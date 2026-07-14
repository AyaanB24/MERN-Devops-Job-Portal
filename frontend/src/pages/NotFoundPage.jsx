import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text mb-4">
          404
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
            <Home size={20} />
            Go Home
          </Link>
          <Link to="/jobs" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold rounded-lg transition-colors">
            <ArrowLeft size={20} />
            Browse Jobs
          </Link>
        </div>
      </div>
    </div>
  )
}
