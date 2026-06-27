import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsNextProps {
  articleTitle?: string;
}

const BreadcrumbsNext: React.FC<BreadcrumbsNextProps> = ({ articleTitle }) => {
  return (
    <nav className="text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 sm:space-x-2">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-gray-700 hover:text-purple-600 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>

        <li className="inline-flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
          <span className="text-gray-500 dark:text-gray-300 font-semibold cursor-default break-words max-w-[200px] sm:max-w-xs md:max-w-md truncate">
            {articleTitle || 'Article'}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default BreadcrumbsNext;
