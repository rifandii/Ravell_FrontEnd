// src/components/CategoryItem.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types/types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface CategoryItemProps {
  category: Category;
}

const CategoryItem = ({ category }: CategoryItemProps) => {
  const hasChildren = category.children && category.children.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    // Setiap kategori adalah <li>
    <li className="list-none">
      {/* Container utama kategori: Tambahkan hover:bg-gray-200 dark:hover:bg-gray-700 */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-colors duration-200 shadow-sm hover:shadow-md hover:bg-gray-200 dark:hover:bg-gray-700">
        <Link
          to={`/articles?categories__slug=${category.slug}&category_name=${category.name}`}
          // Link hanya mengubah warna teks saat hover, bukan warna latar belakang
          className="flex-grow font-bold text-lg text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
        >
          {category.name}
          <span className="ml-3 text-sm text-gray-500 dark:text-gray-400 font-normal">
            ({category.post_count} posts)
          </span>
        </Link>
        
        {hasChildren && (
          <button 
            onClick={toggleExpand} 
            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      
      {/* Rekursi untuk Sub-Kategori */}
      {hasChildren && isExpanded && (
        <ul className="mt-2 pl-4 border-l border-gray-300 dark:border-gray-600 space-y-1">
          {category.children!.map((child) => (
            // Untuk Sub-kategori, kita kembalikan gaya yang lebih ringkas
            <CategoryItem key={child.id} category={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default CategoryItem;