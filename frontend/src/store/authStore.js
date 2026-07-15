import { create } from 'zustand'
import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'

// Initialize token at module level (not wrapped in IIFE)
const storedToken = localStorage.getItem('token')
const initialToken = storedToken && storedToken !== 'undefined' ? storedToken : null

// Set axios default header with token on app startup
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`
}

export const useAuthStore = create((set, get) => ({
  token: initialToken,
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      })

      const { token, user } = response.data.data

      // Store token in localStorage
      localStorage.setItem('token', token)

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Update store
      set({
        token,
        user,
        isLoading: false,
        error: null
      })

      // Return the full response for role-based redirects
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed'
      set({ error: errorMsg, isLoading: false, token: null, user: null })
      throw error
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, userData)

      const { token, user } = response.data.data

      // Store token in localStorage
      localStorage.setItem('token', token)

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Update store
      set({
        token,
        user,
        isLoading: false,
        error: null
      })

      // Return the full response for role-based redirects
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed'
      set({ error: errorMsg, isLoading: false, token: null, user: null })
      throw error
    }
  },

  getProfile: async () => {
    const { token } = get()
    if (!token) {
      return null
    }

    set({ isLoading: true, error: null })
    try {
      const response = await axios.get(`${API_BASE}/auth/profile`)
      const user = response.data.data

      set({
        user,
        isLoading: false
      })

      return user
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch profile'
      set({ error: errorMsg, isLoading: false, user: null })

      // Clear invalid token
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      set({ token: null })

      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    set({
      token: null,
      user: null,
      error: null
    })
  },

  isAuthenticated: () => {
    const { token } = get()
    return !!token
  },

  clearError: () => {
    set({ error: null })
  },

  // Helper methods for role checking
  isRecruiter: () => {
    const { user } = get()
    return user?.role === 'recruiter'
  },

  isCandidate: () => {
    const { user } = get()
    return user?.role === 'candidate'
  },

  isAdmin: () => {
    const { user } = get()
    return user?.role === 'admin'
  },

  // Profile update methods
  updateProfile: async (updatedData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.put(`${API_BASE}/auth/profile`, updatedData)
      const updatedUser = response.data.data

      set({
        user: updatedUser,
        isLoading: false
      })

      return updatedUser
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile'
      set({ error: errorMsg, isLoading: false })
      throw error
    }
  },

  uploadResume: async (file) => {
    set({ isLoading: true, error: null })
    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await axios.post(`${API_BASE}/auth/profile/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update user with new resume path from response
      if (response.data.data?.user) {
        set({ user: response.data.data.user, isLoading: false })
      } else {
        set({ isLoading: false })
      }
      
      return response.data
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload resume'
      set({ error: errorMsg, isLoading: false })
      throw error
    }
  }
}))
