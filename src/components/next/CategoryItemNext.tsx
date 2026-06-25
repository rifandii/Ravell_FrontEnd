'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Category } from '../../types/types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CategoryItemProps {
  category: Category;
  depth?: number;
}

const CategoryItemNext = ({ category, depth = 0 }: CategoryItemProps) => {
  const hasChildren = category.children && category.children.length > 0;
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const isChild = depth > 0;

  return (
    <li className="list-none">
      <div 
        className={`flex items-center justify-between transition-all duration-200 rounded-xl border ${
          isChild 
            ? 'bg-purple-50/40 border-purple-200/40 dark:bg-purple-950/15 dark:border-purple-900/30 hover:bg-purple-50/80 hover:border-purple-300/60 dark:hover:bg-purple-950/30 dark:hover:border-purple-800/40 p-3.5 shadow-sm hover:shadow' 
            : 'bg-purple-50 border-purple-200/80 dark:bg-purple-950/40 dark:border-purple-800/40 hover:bg-purple-100/80 hover:border-purple-300 dark:hover:bg-purple-950/60 dark:hover:border-purple-700/50 p-4 shadow-sm hover:shadow-md'
        }`}
      >
        <Link
          href={`/articles?categories__slug=${category.slug}&category_name=${category.name}`}
          className={`flex-grow hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${
            isChild ? 'font-semibold text-base text-gray-700 dark:text-gray-200' : 'font-bold text-lg text-gray-900 dark:text-white'
          }`}
        >
          {category.name}
          <span className="ml-3 text-xs text-gray-400 dark:text-gray-500 font-normal">
            ({category.post_count} {category.post_count === 1 ? 'post' : 'posts'})
          </span>
        </Link>
        
        {hasChildren && (
          <button 
            onClick={toggleExpand} 
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <ul className="mt-2.5 pl-6 border-l-2 border-dashed border-purple-200 dark:border-purple-950/60 space-y-2 ml-5 mb-2.5">
          {category.children!.map((child) => (
            <CategoryItemNext key={child.id} category={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CategoryItemNext;
