import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import axios from 'axios'
import { useThemeStore } from './store/themeStore'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import ApplicationDetailPage from './pages/ApplicationDetailPage'
import CandidateProfilePage from './pages/CandidateProfilePage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import CandidateDashboard from './pages/CandidateDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import ManageJobsPage from './pages/ManageJobsPage'
import ManageCompaniesPage from './pages/ManageCompaniesPage'
import ViewApplicationsPage from './pages/ViewApplicationsPage'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  const { isDark, initTheme } = useThemeStore()
  const { token, getProfile, user } = useAuthStore()
  
  useEffect(() => {
    initTheme()
  }, [initTheme])

  // Load user profile if token exists on app initialization
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    
    if (storedToken && storedToken !== 'undefined' && !user) {
      // Ensure axios has the token
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      
      // Fetch profile
      getProfile().catch(err => {
        console.log('Failed to load profile on app init:', err.message)
      })
    }
  }, [])

  return (
    <Router>
      <div className={isDark ? 'dark' : ''}>
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/job/:id" element={<JobDetailPage />} />
              
              {/* Protected Routes - Candidate */}
              <Route 
                path="/candidate/dashboard" 
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <CandidateDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/application/:applicationId" 
                element={
                  <ProtectedRoute requiredRole="candidate">
                    <ApplicationDetailPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes - Recruiter */}
              <Route 
                path="/recruiter/dashboard" 
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <RecruiterDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/candidate/:candidateId/profile" 
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <CandidateProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recruiter/manage-jobs" 
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <ManageJobsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recruiter/manage-companies" 
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <ManageCompaniesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recruiter/job/:id/applications" 
                element={
                  <ProtectedRoute requiredRole="recruiter">
                    <ViewApplicationsPage />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes - Admin */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* 404 Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  )
}

export default App
