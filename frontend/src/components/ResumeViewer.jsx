import React, { useState } from 'react'
import { FileText, Download, X, Maximize2, Minimize2 } from 'lucide-react'

/**
 * ResumeViewer Component
 * Displays a resume with viewer controls
 * Supports PDF preview and download
 */
export default function ResumeViewer({ resumePath, candidateName = 'Candidate' }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  if (!resumePath) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center border border-dashed border-gray-300 dark:border-gray-600">
        <FileText size={40} className="text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">No resume uploaded yet</p>
      </div>
    )
  }

  // Construct full URL for the resume
  const resumeUrl = resumePath.startsWith('http') 
    ? resumePath 
    : `/api${resumePath}`

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = resumeUrl
    link.download = `${candidateName}_Resume.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleIframeError = () => {
    setError('Resume file not accessible from server. Please use the download button.')
    setIsLoading(false)
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-blue-600" />
          <span className="font-semibold text-gray-900 dark:text-white truncate">
            {candidateName}'s Resume
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title="Download resume"
          >
            <Download size={20} className="text-green-600" />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 size={20} className="text-blue-600" />
            ) : (
              <Maximize2 size={20} className="text-blue-600" />
            )}
          </button>

          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Close"
            >
              <X size={20} className="text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className={`flex items-center justify-center ${isFullscreen ? 'h-screen' : 'h-96 md:h-screen'} bg-gray-200 dark:bg-gray-900`}>
        {error ? (
          <div className="text-center p-8">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Download size={20} />
              Download Instead
            </button>
          </div>
        ) : (
          <iframe
            key={resumeUrl}
            src={`${resumeUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
            title={`${candidateName}'s Resume`}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading resume...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Resume Preview
        </p>
        <button
          onClick={handleDownload}
          className="text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
        >
          <Download size={16} />
          Download
        </button>
      </div>
    </div>
  )
}
