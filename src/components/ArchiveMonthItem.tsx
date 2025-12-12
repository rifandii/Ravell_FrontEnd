// src/components/ArchiveMonthItem.tsx (Fixing Data Overlap)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPaginatedArticles } from '../services/apiClient';
import type { Article } from '../types/types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ArchiveMonthItemProps {
  year: number;
  monthNumber: number;
  monthName: string;
  postCount: number;
}

const ArchiveMonthItem = ({ year, monthNumber, monthName, postCount }: ArchiveMonthItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const hasPosts = postCount > 0;

  useEffect(() => {
    // Pastikan kita hanya fetch sekali saat isExpanded = true dan articles masih kosong
    if (isExpanded && hasPosts && articles.length === 0) {
      setLoading(true);
      const fetchMonthlyArticles = async () => {
        try {
          // Kunci filter dengan parameter year dan month
          const query = `/articles/?year=${year}&month=${monthNumber}&page_size=500`; 
          const data = await getPaginatedArticles(query);
          setArticles(data.results);
        } catch (err) {
          console.error(`Error fetching articles for ${monthName} ${year}:`, err);
        } finally {
          setLoading(false);
        }
      };
      fetchMonthlyArticles();
    }
  }, [isExpanded, hasPosts, articles.length, monthNumber, year, monthName]); // Semua dependencies yang dibutuhkan harus ada

  return (
    <div className="relative">
      {/* Tombol Utama Bulan */}
      <div 
        className={`flex items-center justify-between py-1 transition-colors duration-200 cursor-pointer
                  before:content-[''] before:absolute before:-left-[10px] before:top-2.5 before:h-3 before:w-3 before:rounded-full 
                  before:bg-blue-600 dark:before:bg-blue-500 before:z-10 before:ring-4 before:ring-white dark:before:ring-gray-800 
                  ${hasPosts ? 'hover:text-blue-600 dark:hover:text-blue-400' : 'text-gray-500 dark:text-gray-600'}`}
        onClick={() => hasPosts && setIsExpanded(!isExpanded)}
      >
        <span className="text-lg font-semibold pl-4">
          {monthName} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({postCount} posts)</span>
        </span>
        {hasPosts && (
          <button className="p-1">
            {isExpanded ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Daftar Artikel (Hanya muncul jika diperluas) */}
      {isExpanded && (
        <ul className="mt-2 pl-4 space-y-4">
          {/* ... (loading state) */}
          {!loading && articles.map(article => (
            <li 
                key={article.id} 
                // MARKER ARTIKEL: Ganti -left-7 menjadi -left-[14px] (atau -left-3.5) untuk menempel ke garis
                className="relative before:content-[''] before:absolute before:-left-[14px] before:top-3 before:h-1.5 before:w-1.5 before:rounded-full before:bg-blue-500 dark:before:bg-blue-400 before:z-10"
            >
              <Link 
                to={`/articles/${article.slug}`} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors block pl-4 font-semibold"
              >
                {new Date(article.published_date).toLocaleDateString('default', { day: 'numeric', month: 'short' })} &mdash; {article.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArchiveMonthItem;