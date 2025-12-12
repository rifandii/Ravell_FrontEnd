// src/components/Pagination.tsx
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

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
    <div className="flex justify-center items-center mt-12 space-x-4">
      
      {/* Tombol Previous */}
      <button
        onClick={() => handlePageChange(prevPageUrl)}
        disabled={!prevPageUrl}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer" 
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/> Previous
      </button>
      
      {/* Tombol Nomor Halaman */}
      {renderPaginationButtons()}
      
      {/* Display Halaman */}
      <span className="text-gray-700 dark:text-gray-300 font-semibold hidden sm:inline">
        Page {currentPage} of {totalPages}
      </span>
      
      {/* Tombol Next */}
      <button
        onClick={() => handlePageChange(nextPageUrl)}
        disabled={!nextPageUrl}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        Next <FontAwesomeIcon icon={faArrowRight} className="ml-2"/>
      </button>
    </div>
  );
};

export default Pagination;