import { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// SearchBar — Search input with magnifying icon and submit button
// ─────────────────────────────────────────────────────────────────────────────

const SearchBar = ({ value, onChange, onSubmit, placeholder = 'Search...', className = '' }) => {
  const [localValue, setLocalValue] = useState(value);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(localValue);
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={localValue}
          onChange={(e) => { setLocalValue(e.target.value); onChange?.(e.target.value); }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
