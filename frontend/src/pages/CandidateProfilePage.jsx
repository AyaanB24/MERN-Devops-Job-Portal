import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, Mail, Download, FileText, User, Award } from 'lucide-react'
import axios from 'axios'
import ResumeViewer from '../components/ResumeViewer'

export default function CandidateProfilePage() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCandidateProfile()
  }, [candidateId])

  const fetchCandidateProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch candidate details using their ID
      const response = await axios.get(`http://localhost:5000/api/auth/candidate/${candidateId}`)
      
      if (response.data.success) {
        setCandidate(response.data.data)
        console.log('Candidate profile loaded:', response.data.data)
      } else {
        setError('Failed to load candidate profile')
      }
    } catch (error) {
      console.error('Error fetching candidate:', error)
      if (error.response?.status === 404) {
        setError('Candidate not found')
      } else {
        setError('Failed to load candidate profile: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading candidate profile...</p>
        </div>
      </div>
    )
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
              {error || 'Candidate not found'}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Go Back
            </button>
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Applications
        </button>

        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              {/* Profile Photo */}
              {candidate.profilePhoto ? (
                <img
                  src={candidate.profilePhoto}
                  alt={candidate.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-600"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center border-4 border-blue-600">
                  <User size={40} className="text-white" />
                </div>
              )}

              {/* Candidate Info */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {candidate.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <Mail size={18} className="text-blue-600" />
                  <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 transition-colors">
                    {candidate.email}
                  </a>
                </div>
                {candidate.bio && (
                  <p className="text-gray-700 dark:text-gray-300 max-w-md">
                    {candidate.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section - Full Width Horizontal */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Award size={28} className="text-blue-600" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {candidate.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Profile Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">CANDIDATE ID</p>
              <p className="text-gray-900 dark:text-white font-mono break-all">{candidate._id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">MEMBER SINCE</p>
              <p className="text-gray-900 dark:text-white">
                {new Date(candidate.createdAt).toLocaleDateString()}
              </p>
            </div>

            {candidate.bio && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">BIO</p>
                <p className="text-gray-700 dark:text-gray-300">{candidate.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Resume Section - Full Width Vertical */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FileText size={28} className="text-green-600" />
            Resume
          </h2>
          {candidate.resume ? (
            <div className="min-h-screen">
              <ResumeViewer resumePath={candidate.resume} candidateName={candidate.name} />
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No resume uploaded
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700 mt-8 flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Back to Applications
          </button>
        </div>
      </div>
    </div>
  )
}
