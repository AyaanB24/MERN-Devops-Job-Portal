import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createNewJob,
  clearCreateJobState,
  selectCreateJobStatus,
  selectCreateJobError,
} from './jobSlice';
import { selectCurrentCompany, fetchMyCompany } from '../company/companySlice';

// ─────────────────────────────────────────────────────────────────────────────
// CreateJobPage — Recruiter creates a new job posting.
// ─────────────────────────────────────────────────────────────────────────────

const CreateJobPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const company = useSelector(selectCurrentCompany);
  const status = useSelector(selectCreateJobStatus);
  const error = useSelector(selectCreateJobError);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    location: '',
    experience: '0-1 years',
    jobType: 'Full-time',
    skills: '',
  });

  // Ensure recruiter has a company before allowing job creation
  useEffect(() => {
    if (!company) {
      dispatch(fetchMyCompany());
    }
  }, [dispatch, company]);

  useEffect(() => {
    return () => { dispatch(clearCreateJobState()); };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company) {
      toast.error('You must create a company profile first!');
      navigate('/recruiter/company');
      return;
    }

    const payload = {
      ...formData,
      company: company._id,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      salary: Number(formData.salary),
    };

    const result = await dispatch(createNewJob(payload));
    if (createNewJob.fulfilled.match(result)) {
      toast.success('Job posted successfully!');
      navigate('/recruiter/jobs/manage');
    } else {
      toast.error(result.payload || 'Failed to post job');
    }
  };

  const isLoading = status === 'loading';

  if (!company && status !== 'loading') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-500 mb-4">Please set up your company profile before posting a job.</p>
        <button
          onClick={() => navigate('/recruiter/company')}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Setup Company
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Job Posting</h1>
      <p className="text-sm text-gray-500 mb-8">Post a new opportunity for your company.</p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                id="title" name="title" type="text" required
                value={formData.title} onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                id="location" name="location" type="text" required
                value={formData.location} onChange={handleChange}
                placeholder="e.g. Remote, New York, NY"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Salary (Annual ₹) *</label>
              <input
                id="salary" name="salary" type="number" required min="0"
                value={formData.salary} onChange={handleChange}
                placeholder="e.g. 1500000"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
              <select
                id="jobType" name="jobType" required
                value={formData.jobType} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
              <select
                id="experience" name="experience" required
                value={formData.experience} onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
              </label>
              <input
                id="skills" name="skills" type="text"
                value={formData.skills} onChange={handleChange}
                placeholder="e.g. React, Node.js, MongoDB"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                id="description" name="description" required rows={6} maxLength={5000}
                value={formData.description} onChange={handleChange}
                placeholder="Job description, responsibilities, and requirements..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-indigo-500 transition resize-y"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/recruiter/dashboard')}
              className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg transition text-sm"
            >
              {isLoading ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateJobPage;
