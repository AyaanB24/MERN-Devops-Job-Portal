import { useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// usePagination — manages current page state
// ─────────────────────────────────────────────────────────────────────────────

const usePagination = (initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => prev + 1);
  }, []);

  const goToPrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  return {
    currentPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    setCurrentPage,
  };
};

export default usePagination;
