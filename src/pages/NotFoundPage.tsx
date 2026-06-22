// src/pages/NotFoundPage.tsx
import { useLocation, Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft, Search } from 'lucide-react';
import SEO from '../components/SEO';

const NotFoundPage = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
      />

      {/* Icon */}
      <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Content Unavailable
      </h3>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 mt-2">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-8 font-mono">
        {location.pathname}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Browse Articles
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
