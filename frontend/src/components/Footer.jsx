import React from 'react'
import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">JP</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">JobPortal</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Connect with top companies and find your dream job in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/jobs" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Browse Jobs</a></li>
              <li><a href="/companies" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Companies</a></li>
              <li><a href="/register" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">Post a Job</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail size={16} />
                <span>info@jobportal.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 text-gray-600 dark:text-gray-400 hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 text-gray-600 dark:text-gray-400 hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-600 text-gray-600 dark:text-gray-400 hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2026 JobPortal. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
