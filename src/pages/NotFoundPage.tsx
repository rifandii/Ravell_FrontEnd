// src/pages/NotFoundPage.tsx
import { useLocation, Link } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft, Search } from 'lucide-react';
import SEO from '../components/SEO';

const NotFoundPage = () => {
  const location = useLocation();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
      />

      {/* Icon */}
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        Content Unavailable
      </h2>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 mb-2">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 font-mono">
        {location.pathname}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          Home
        </Link>
        <Link
          to="/articles"
          className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Search className="w-4 h-4" />
          Browse Articles
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
