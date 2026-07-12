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
import FileUpload from '../../components/form/FileUpload';
import Avatar from '../../components/ui/Avatar';

// ─────────────────────────────────────────────────────────────────────────────
// CandidateProfilePage — Edit bio, skills, and upload resume.
// ─────────────────────────────────────────────────────────────────────────────

const CandidateProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({ bio: '', skills: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || '',
        skills: user.skills?.join(', ') || '',
      });
    }
  }, [user]);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">My Profile</h1>
      <p className="text-sm text-slate-500 mb-8">Manage your career profile and resume.</p>

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Profile Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={250}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell recruiters about yourself..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
            <p className="mt-1 text-xs text-slate-400 text-right">{formData.bio.length}/250</p>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-slate-700 mb-1">
              Skills <span className="text-slate-400 font-normal">(comma-separated)</span>
            </label>
            <input
              id="skills"
              name="skills"
              type="text"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB, Docker"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {isLoading ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Resume Upload Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Resume</h2>
        <p className="text-sm text-slate-500 mb-4">Upload your resume as a PDF (max 5MB).</p>

        <FileUpload onFileSelect={setResumeFile} currentFile={user?.resume} />

        {resumeFile && (
          <form onSubmit={handleResumeUpload} className="mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isLoading ? 'Uploading…' : 'Upload Resume'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CandidateProfilePage;
