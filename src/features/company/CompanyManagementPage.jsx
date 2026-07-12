import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyCompany,
  saveCompany,
  clearCompanyState,
  selectCurrentCompany,
  selectCompanyStatus,
  selectCompanySaveStatus,
  selectCompanySaveError,
} from './companySlice';

// ─────────────────────────────────────────────────────────────────────────────
// CompanyManagementPage — Recruiter manages their company profile
// ─────────────────────────────────────────────────────────────────────────────

const CompanyManagementPage = () => {
  const dispatch = useDispatch();
  const company = useSelector(selectCurrentCompany);
  const status = useSelector(selectCompanyStatus);
  const saveStatus = useSelector(selectCompanySaveStatus);
  const saveError = useSelector(selectCompanySaveError);

  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '',
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchMyCompany());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || '',
        description: company.description || '',
        website: company.website || '',
      });
    }
  }, [company]);

  useEffect(() => {
    return () => { dispatch(clearCompanyState()); };
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    const result = await dispatch(saveCompany({ id: company?._id, companyData: formData }));
    if (saveCompany.fulfilled.match(result)) {
      setSuccessMsg('Company profile saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const isLoading = status === 'loading';
  const isSaving = saveStatus === 'loading';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Company Profile</h1>
      <p className="text-sm text-slate-500 mb-8">Manage your company details to attract top candidates.</p>

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}
      {saveError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {saveError}
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded w-full" />
          <div className="h-32 bg-slate-200 rounded w-full" />
          <div className="h-10 bg-slate-200 rounded w-full" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://acmecorp.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Company Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                maxLength={1000}
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell candidates about your company's mission and culture..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
              <p className="mt-1 text-xs text-slate-400 text-right">{formData.description.length}/1000</p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {isSaving ? 'Saving…' : 'Save Company Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CompanyManagementPage;
