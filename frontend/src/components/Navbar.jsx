import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { user, logout, isAuthenticated, isRecruiter, isCandidate, isAdmin } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (isRecruiter()) return '/recruiter/dashboard'
    if (isCandidate()) return '/candidate/dashboard'
    if (isAdmin()) return '/admin/dashboard'
    return '/profile'
  }

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <span className="text-white font-bold text-lg">JP</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:inline">JobPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Browse Jobs - Only for non-authenticated or candidates */}
            {(!isAuthenticated() || isCandidate()) && (
              <Link to="/jobs" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Browse Jobs
              </Link>
            )}
            
            {isAuthenticated() ? (
              <div className="flex items-center gap-4">
                {/* Dropdown Menu */}
                <div className="relative group">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium hidden sm:inline">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-10">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{user?.role}</p>
                      </div>

                      {/* Dashboard */}
                      <Link
                        to={getDashboardLink()}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {/* Profile */}
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </Link>

                      {/* Recruiter Options */}
                      {isRecruiter() && (
                        <>
                          <Link
                            to="/recruiter/manage-jobs"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Manage Jobs
                          </Link>
                          <Link
                            to="/recruiter/manage-companies"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setDropdownOpen(false)}
                          >
                            Manage Companies
                          </Link>
                        </>
                      )}

                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                      {/* Logout */}
                      <button
                        onClick={() => {
                          handleLogout();
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Sign up
                </Link>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-800">
            {/* Browse Jobs - Only for non-authenticated or candidates */}
            {(!isAuthenticated() || isCandidate()) && (
              <Link to="/jobs" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                Browse Jobs
              </Link>
            )}
            
            {isAuthenticated() ? (
              <>
                <Link to={getDashboardLink()} className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Dashboard
                </Link>
                <Link to="/profile" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Profile
                </Link>
                {isRecruiter() && (
                  <>
                    <Link to="/recruiter/manage-jobs" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                      Manage Jobs
                    </Link>
                    <Link to="/recruiter/manage-companies" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                      Companies
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-4 text-red-500 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                  Sign in
                </Link>
                <Link to="/register" className="block py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center font-medium mt-2">
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
