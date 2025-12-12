// src/pages/ArticleListPage.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPaginatedArticles } from '../services/apiClient';
import type { Article } from '../types/types';
import ArticleCard from '../components/ArticleCard';
import Pagination from '../components/Pagination';
import SkeletonCard from '../components/SkeletonCard'; // Pastikan skeleton ini tingginya sesuai
import { 
  Search, 
  FolderOpen, 
  Hash, 
  Calendar, 
  BookOpen, 
  XCircle, 
  FileQuestion 
} from 'lucide-react';

const ArticleListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);

  // --- 1. Contextual Header Logic ---
  // Kita memisahkan judul, ikon, dan deskripsi berdasarkan filter yang aktif
  const pageContext = useMemo(() => {
    const category = searchParams.get('category_name');
    const tag = searchParams.get('tag_name');
    const search = searchParams.get('search');
    const year = searchParams.get('year');
    
    if (category) {
      return {
        title: category,
        subtitle: 'Category Archive',
        icon: FolderOpen,
        isFiltered: true
      };
    }
    if (tag) {
      return {
        title: `#${tag}`,
        subtitle: 'Tagged Articles',
        icon: Hash,
        isFiltered: true
      };
    }
    if (search) {
      return {
        title: `Results for "${search}"`,
        subtitle: 'Search Results',
        icon: Search,
        isFiltered: true
      };
    }
    if (year) {
      return {
        title: 'Time Capsule',
        subtitle: `Archive from ${year}`,
        icon: Calendar,
        isFiltered: true
      };
    }
    return {
      title: 'All Articles',
      subtitle: 'Knowledge Base',
      icon: BookOpen,
      isFiltered: false
    };
  }, [searchParams]);

  const fetchArticles = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaginatedArticles(url);
      setArticles(data.results);
      setCount(data.count);
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);
    } catch (err) {
      setError('Failed to load content stream. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const query = searchParams.toString();
    fetchArticles(`/articles/?${query}`);
  }, [searchParams, fetchArticles]);

  const handlePageChange = (url: string | null) => {
    if (url) {
      const urlObj = new URL(url);
      setSearchParams(urlObj.searchParams);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  // --- 2. Loading State (Grid Layout) ---
  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        {/* Skeleton Header */}
        <div className="mb-12 text-center">
           <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 animate-pulse"></div>
           <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto animate-pulse"></div>
        </div>
        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-full">
               {/* Asumsi SkeletonCard sudah ada */}
               <SkeletonCard /> 
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- 3. Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Connection Failed</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const Icon = pageContext.icon;

  return (
    <div className="w-full px-4 md:px-8 py-8 min-h-screen animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-4 shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {pageContext.title}
        </h1>
        
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
          <span className="font-medium uppercase tracking-wide">{pageContext.subtitle}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{count} {count === 1 ? 'Result' : 'Results'}</span>
        </div>

        {/* Clear Filter Button (Conditional) */}
        {pageContext.isFiltered && (
          <button
            onClick={clearFilters}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm hover:shadow"
          >
            <XCircle className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* --- CONTENT GRID --- */}
      {articles.length > 0 ? (
        <div className="space-y-12">
          {/* Grid Artikel */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 md:gap-8">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {Math.ceil(count / 10) > 1 && (
            <div className="flex justify-center pt-8 border-t border-gray-100 dark:border-gray-800">
              <Pagination
                count={count}
                nextPageUrl={nextPageUrl}
                prevPageUrl={prevPageUrl}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      ) : (
        /* --- EMPTY STATE --- */
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
            <FileQuestion className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No articles found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8">
            We couldn't find what you're looking for. Try adjusting your search keywords or clear the filters to see everything.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={clearFilters}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-600/20"
            >
              View All Articles
            </button>
            <Link 
              to="/"
              className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleListPage;