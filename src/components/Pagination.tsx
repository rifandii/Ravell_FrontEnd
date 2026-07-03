// src/components/Pagination.tsx
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  count: number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  handlePageChange: (url: string | null) => void;
}

const Pagination = ({ count, nextPageUrl, prevPageUrl, handlePageChange }: PaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = Math.ceil(count / 10);
  const currentPage = Math.min(Math.max(Number(searchParams.get('page')) || 1, 1), totalPages);

  if (totalPages <= 1) {
    return null;
  }

  const getPageItems = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const validPages = Array.from(pages)
      .filter((page) => page >= 1 && page <= totalPages)
      .sort((a, b) => a - b);

    const items: Array<number | 'ellipsis-left' | 'ellipsis-right'> = [];
    validPages.forEach((page, index) => {
      const previousPage = validPages[index - 1];
      if (previousPage && page - previousPage > 1) {
        items.push(previousPage === 1 ? 'ellipsis-left' : 'ellipsis-right');
      }
      items.push(page);
    });

    return items;
  };

  const pageItems = getPageItems();

  const renderPaginationButtons = () => {
    return pageItems.map((item) => {
      if (typeof item !== 'number') {
        return (
          <span
            key={item}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        );
      }

      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', String(item));
      const isActive = item === currentPage;

      return (
        <button
          key={item}
          onClick={() => setSearchParams(newSearchParams)}
          aria-label={`Go to page ${item}`}
          aria-current={isActive ? 'page' : undefined}
          className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-950 ${
            isActive
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'border border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 dark:hover:text-purple-300'
          }`}
        >
          {item}
        </button>
      );
    });
  };

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
      aria-label="Pagination"
    >
      
      {/* Previous page */}
      <button
        onClick={() => handlePageChange(prevPageUrl)}
        disabled={!prevPageUrl}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 dark:hover:text-purple-300 dark:disabled:hover:border-gray-700 dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-300"
        aria-label="Go to previous page"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>
      
      {/* Page numbers are hidden on very small screens. */}
      <div className="hidden items-center gap-2 sm:flex">
        {renderPaginationButtons()}
      </div>
      
      {/* Current page summary */}
      <span className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>
      
      {/* Next page */}
      <button
        onClick={() => handlePageChange(nextPageUrl)}
        disabled={!nextPageUrl}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 dark:hover:text-purple-300 dark:disabled:hover:border-gray-700 dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-300"
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;
