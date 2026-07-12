import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateProfile,
  uploadResume,
  selectCurrentUser,
  selectAuthStatus,
  selectAuthError,
  clearError,
} from '../auth/authSlice';

// ─────────────────────────────────────────────────────────────────────────────
// CandidateProfilePage — Edit bio, skills, and upload resume.
// Reads user from auth.user (Redux). Updates go through authSlice thunks.
// ─────────────────────────────────────────────────────────────────────────────

const CandidateProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Populate form with current user data on mount
  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
      });
    }
  }, [user]);

  // Clear errors on unmount
  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const profilePayload = {
      bio: formData.bio,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
    };
    const result = await dispatch(updateProfile(profilePayload));
    if (updateProfile.fulfilled.match(result)) {
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    setSuccessMsg('');
    const formPayload = new FormData();
    formPayload.append('resume', resumeFile);
    const result = await dispatch(uploadResume(formPayload));
    if (uploadResume.fulfilled.match(result)) {
      setSuccessMsg('Resume uploaded successfully!');
      setResumeFile(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const isLoading = status === 'loading';

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
      <p className="text-sm text-gray-500 mb-8">Manage your career profile and resume.</p>

      {/* Success / Error Banners */}
      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Profile Info Card ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={250}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell recruiters about yourself..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">{formData.bio.length}/250</p>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
              Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, Docker"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
          >
            {isLoading ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* ── Resume Upload Card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Resume</h2>
        <p className="text-sm text-gray-500 mb-4">Upload your resume as a PDF (max 5MB).</p>

        {user?.resume && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-600">📄 Current resume on file</span>
            <span className="text-xs text-green-600 font-medium">Uploaded ✓</span>
          </div>
        )}

        <form onSubmit={handleResumeUpload} className="flex items-center gap-3">
          <label className="flex-1">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition cursor-pointer"
            />
          </label>
          <button
            type="submit"
            disabled={!resumeFile || isLoading}
            className="shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
          >
            {isLoading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
