// src/components/Pagination.tsx
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  count: number;
  nextPageUrl: string | null;
  prevPageUrl: string | null;
  handlePageChange: (url: string | null) => void;
}

const Pagination = ({ count, nextPageUrl, prevPageUrl, handlePageChange }: PaginationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = Math.ceil(count / 10);
  const currentPage = Number(searchParams.get('page')) || 1;

  if (totalPages <= 1) {
    return null;
  }

  const renderPaginationButtons = () => {
    const pageButtons = [];

    for (let i = 1; i <= totalPages; i++) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', String(i));
      
      pageButtons.push(
        <button
          key={i}
          // PERBAIKAN: Tombol nomor memanggil setSearchParams langsung
          onClick={() => setSearchParams(newSearchParams)}
          className={`px-4 py-2 rounded-full font-semibold transition-colors cursor-pointer ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return pageButtons;
  };

  return (
    <div className="flex flex-wrap justify-center items-center mt-12 gap-2 sm:gap-3">
      
      {/* Tombol Previous */}
      <button
        onClick={() => handlePageChange(prevPageUrl)}
        disabled={!prevPageUrl}
        className="px-3 py-2 sm:px-4 bg-gray-200 dark:bg-gray-700 rounded-full text-sm sm:text-base text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer" 
      >
        <ArrowLeft size={16} className="mr-1 sm:mr-2 inline"/> <span className="hidden sm:inline">Previous</span><span className="sm:hidden">Prev</span>
      </button>
      
      {/* Tombol Nomor Halaman — hidden on very small screens */}
      <div className="hidden sm:flex gap-2">
        {renderPaginationButtons()}
      </div>
      
      {/* Display Halaman */}
      <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm sm:text-base">
        Page {currentPage} of {totalPages}
      </span>
      
      {/* Tombol Next */}
      <button
        onClick={() => handlePageChange(nextPageUrl)}
        disabled={!nextPageUrl}
        className="px-3 py-2 sm:px-4 bg-gray-200 dark:bg-gray-700 rounded-full text-sm sm:text-base text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Next <ArrowRight size={16} className="ml-1 sm:ml-2 inline"/>
      </button>
    </div>
  );
};

export default Pagination;