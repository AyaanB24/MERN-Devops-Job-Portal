import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'

/**
 * GoogleLoginButton Component
 * Handles Google Sign-In button and OAuth flow
 */
export default function GoogleLoginButton({ 
  onSuccess, 
  onError, 
  role = null,
  isLoading = false
}) {
  const [googleLoaded, setGoogleLoaded] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [hasClientId, setHasClientId] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const isConfigured = clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com'
    setHasClientId(isConfigured)
  }, [])

  useEffect(() => {
    // Load Google Sign-In script only once globally
    if (window.google?.accounts?.id) {
      setGoogleLoaded(true)
      renderGoogleButton()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    
    script.onload = () => {
      setGoogleLoaded(true)
      renderGoogleButton()
    }

    script.onerror = () => {
      console.error('Failed to load Google Sign-In script')
      setGoogleLoaded(false)
    }

    document.body.appendChild(script)
  }, [hasClientId])

  const renderGoogleButton = () => {
    if (!hasClientId) return

    // Wait for Google library to be fully available
    const checkGoogle = setInterval(() => {
      if (window.google?.accounts?.id && document.getElementById('google-button-container')) {
        clearInterval(checkGoogle)

        try {
          const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
          
          // Initialize only once
          if (!window.__googleInitialized) {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredentialResponse
            })
            window.__googleInitialized = true
          }

          // Render button
          const container = document.getElementById('google-button-container')
          if (container && container.children.length === 0) {
            window.google.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              text: 'signin_with'
            })
          }
        } catch (error) {
          console.error('Error rendering Google button:', error)
        }
      }
    }, 100)

    // Clear interval after 5 seconds
    setTimeout(() => clearInterval(checkGoogle), 5000)
  }

  const handleCredentialResponse = async (response) => {
    try {
      setProcessing(true)
      const idToken = response.credential

      const backendResponse = await fetch(
        '/api/oauth/verify-google-token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            idToken, 
            role: role || null,
            isSignup: !!role
          })
        }
      )

      const data = await backendResponse.json()

      if (data.success) {
        const userData = data.data
        
        // IMPORTANT: Update store and axios IMMEDIATELY
        localStorage.setItem('token', userData.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
        useAuthStore.setState({
          token: userData.token,
          user: userData.user,
          isLoading: false,
          error: null
        })
        
        if (data.isNew) {
          // NEW USER - show role selection
          sessionStorage.setItem('oauthData', JSON.stringify(userData))
          navigate('/oauth-select-role')
        } else {
          // EXISTING USER - auto-redirect immediately
          if (onSuccess) {
            onSuccess(userData)
          } else {
            // Auto-redirect for login page
            const userRole = userData.user.role
            if (userRole === 'recruiter') {
              navigate('/recruiter/dashboard')
            } else {
              navigate('/candidate/dashboard')
            }
          }
        }
      } else {
        const errorMsg = data.message || 'Authentication failed'
        if (onError) onError(errorMsg)
        else alert(errorMsg)
      }
    } catch (error) {
      const errorMsg = error.message || 'Authentication failed'
      if (onError) onError(errorMsg)
      else alert(errorMsg)
    } finally {
      setProcessing(false)
    }
  }

  if (!googleLoaded) {
    return (
      <div className="w-full">
        <button disabled className="w-full py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
          <Loader size={18} className="animate-spin" />
          <span className="font-medium">Loading...</span>
        </button>
      </div>
    )
  }

  if (!hasClientId) {
    return (
      <div className="w-full">
        <button 
          onClick={() => alert('Configure VITE_GOOGLE_CLIENT_ID in frontend/.env.local')}
          className="w-full py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium">Continue with Google</span>
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div id="google-button-container" className="flex justify-center" />
      
      {(isLoading || processing) && (
        <div className="mt-3 flex items-center justify-center gap-2 text-blue-600">
          <Loader size={16} className="animate-spin" />
          <span className="text-sm font-medium">Processing...</span>
        </div>
      )}
    </div>
  )
}
