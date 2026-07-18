import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, FileText, Loader, Upload } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import ResumeViewer from '../components/ResumeViewer'

export default function ProfilePage() {
  const { user, isAuthenticated, getProfile, updateProfile, uploadResume, isLoading } = useAuthStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    skills: ''
  })
  const [resumeFile, setResumeFile] = useState(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    
    if (!user) {
      getProfile()
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        skills: (user.skills || []).join(', ')
      })
    }
  }, [user, isAuthenticated, navigate, getProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      })
      
      // Refresh profile to ensure data is persisted
      await getProfile()
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Failed to update profile')
      alert('Failed to update profile')
    }
  }

  const handleResumeUpload = async (e) => {
    e.preventDefault()
    if (!resumeFile) {
      alert('Please select a file')
      return
    }

    try {
      const uploadResponse = await uploadResume(resumeFile)
      
      // Refresh profile immediately to ensure we have latest data
      await getProfile()
      
      alert('Resume uploaded successfully!')
      setResumeFile(null)
      
      // Optionally reset file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) {
        fileInput.value = ''
      }
    } catch (error) {
      console.error('Failed to upload resume:', error)
      alert('Failed to upload resume')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader size={40} className="animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
              <User size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {user.role} • Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Profile
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white opacity-50 cursor-not-allowed focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Skills Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, Node.js, Python, ..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </form>
        </div>

        {/* Resume Upload (Candidate Only) */}
        {user.role === 'candidate' && (
          <div className="space-y-8">
            {/* Resume Preview */}
            {user.resume && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Resume</h2>
                <div className="h-96 md:h-screen">
                  <ResumeViewer resumePath={user.resume} candidateName={user.name} />
                </div>
              </div>
            )}

            {/* Resume Upload Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {user.resume ? 'Update Resume' : 'Upload Resume'}
              </h2>
              <form onSubmit={handleResumeUpload} className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={40} className="text-gray-400" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Click to upload your resume
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        PDF, DOC, DOCX • Max 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleResumeChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                </div>
                
                {resumeFile && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {resumeFile.name}
                    </span>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
                    >
                      <Upload size={16} />
                      {isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
