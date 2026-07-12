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
// Orchestrates filters, job grid, pagination, and all loading/error states.
// ─────────────────────────────────────────────────────────────────────────────

// Skeleton card shown during loading
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="h-3 bg-gray-100 rounded w-1/2 mb-6" />
    <div className="flex gap-2 mb-4">
      <div className="h-3 bg-gray-100 rounded w-1/4" />
      <div className="h-3 bg-gray-100 rounded w-1/4" />
    </div>
    <div className="flex gap-2">
      <div className="h-5 bg-indigo-50 rounded-full w-16" />
      <div className="h-5 bg-indigo-50 rounded-full w-16" />
    </div>
  </div>
);

const JobListPage = () => {
  const dispatch = useDispatch();
  const jobs = useSelector(selectJobs);
  const status = useSelector(selectJobListStatus);
  const error = useSelector(selectJobListError);
  const { currentPage, totalPages } = useSelector(selectPagination);

  // Fetch on mount + whenever page changes
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
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="mt-1 text-sm text-gray-500">
            {status === 'succeeded' && `${jobs.length} job${jobs.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar — Filters */}
          <aside className="lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-6">
              <JobFilters />
            </div>
          </aside>

          {/* Main — Job Grid */}
          <main className="flex-1">
            {/* Error state */}
            {isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-6">
                {error} — Please try again.
              </div>
            )}

            {/* Loading skeletons */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {isEmpty && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-medium">No jobs match your search</p>
                <p className="text-sm mt-1">Try different keywords or clear your filters</p>
              </div>
            )}

            {/* Job Cards Grid */}
            {!isLoading && jobs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 text-sm rounded-lg border transition ${
                      page === currentPage
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
