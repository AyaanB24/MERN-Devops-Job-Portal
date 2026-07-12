import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchJobsList,
  setPage,
  selectJobs,
  selectJobListStatus,
  selectJobListError,
  selectPagination,
} from './jobSlice';
import JobCard from './JobCard';
import JobFilters from './JobFilters';

// ─────────────────────────────────────────────────────────────────────────────
// JobListPage — Public page. No authentication required.
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
    <div className="h-3 bg-slate-100 rounded w-1/2 mb-6" />
    <div className="flex gap-2 mb-4">
      <div className="h-3 bg-slate-100 rounded w-1/4" />
      <div className="h-3 bg-slate-100 rounded w-1/4" />
    </div>
    <div className="flex gap-2">
      <div className="h-5 bg-blue-50 rounded-full w-16" />
      <div className="h-5 bg-blue-50 rounded-full w-16" />
    </div>
  </div>
);

const JobListPage = () => {
  const dispatch = useDispatch();
  const jobs = useSelector(selectJobs);
  const status = useSelector(selectJobListStatus);
  const error = useSelector(selectJobListError);
  const { currentPage, totalPages } = useSelector(selectPagination);

  useEffect(() => {
    dispatch(fetchJobsList());
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    dispatch(setPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoading = status === 'loading';
  const isError = status === 'failed';
  const isEmpty = status === 'succeeded' && jobs.length === 0;

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900">Browse Jobs</h1>
          <p className="mt-1 text-sm text-slate-500">
            {status === 'succeeded' && `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar — Filters */}
          <aside className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-20">
              <JobFilters />
            </div>
          </aside>

          {/* Main — Job Grid */}
          <main className="flex-1">
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-6">
                {error} — Please try again.
              </div>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {isEmpty && (
              <div className="text-center py-20 text-slate-400">
                <svg className="mx-auto w-12 h-12 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-lg font-medium">No jobs match your search</p>
                <p className="text-sm mt-1">Try different keywords or clear your filters</p>
              </div>
            )}

            {!isLoading && jobs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => <JobCard key={job._id} job={job} />)}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default JobListPage;
