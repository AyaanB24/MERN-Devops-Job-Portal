import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setFilter,
  clearFilters,
  fetchJobsList,
  selectFilters,
} from './jobSlice';

// ─────────────────────────────────────────────────────────────────────────────
// JobFilters — Search and filter panel.
// Dispatches setFilter to Redux on change, then triggers a fresh API fetch.
// jobType values must match backend Job model enum exactly.
// ─────────────────────────────────────────────────────────────────────────────

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

const JobFilters = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);

  // Local state for keyword input — avoids an API call on every keystroke.
  // API is triggered on form submit or Enter key only.
  const [localKeyword, setLocalKeyword] = useState(filters.keyword);

  const handleKeywordSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilter({ key: 'keyword', value: localKeyword }));
    dispatch(fetchJobsList({ page: 1 }));
  };

  const handleJobTypeChange = (e) => {
    dispatch(setFilter({ key: 'jobType', value: e.target.value }));
    dispatch(fetchJobsList({ page: 1 }));
  };

  const handleLocationChange = (e) => {
    dispatch(setFilter({ key: 'location', value: e.target.value }));
  };

  // Trigger location search on Enter key
  const handleLocationKeyDown = (e) => {
    if (e.key === 'Enter') {
      dispatch(fetchJobsList({ page: 1 }));
    }
  };

  const handleClear = () => {
    setLocalKeyword('');
    dispatch(clearFilters());
    dispatch(fetchJobsList({ filters: {}, page: 1 }));
  };

  const hasActiveFilters =
    filters.keyword || filters.location || filters.jobType;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        Search & Filter
      </h3>

      {/* Keyword Search */}
      <form onSubmit={handleKeywordSubmit} className="mb-4">
        <label htmlFor="keyword" className="block text-xs text-gray-500 mb-1">
          Keyword / Job Title
        </label>
        <div className="flex gap-2">
          <input
            id="keyword"
            type="text"
            value={localKeyword}
            onChange={(e) => setLocalKeyword(e.target.value)}
            placeholder="e.g. React Developer"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Location */}
      <div className="mb-4">
        <label htmlFor="location" className="block text-xs text-gray-500 mb-1">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={filters.location}
          onChange={handleLocationChange}
          onKeyDown={handleLocationKeyDown}
          placeholder="e.g. Mumbai, Remote"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Job Type */}
      <div className="mb-4">
        <label htmlFor="jobType" className="block text-xs text-gray-500 mb-1">
          Job Type
        </label>
        <select
          id="jobType"
          value={filters.jobType}
          onChange={handleJobTypeChange}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          {JOB_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default JobFilters;
