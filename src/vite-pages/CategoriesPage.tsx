// src/pages/CategoriesPage.tsx
import { useState, useEffect } from 'react';
import { getPaginatedCategories, getPaginatedArticles } from '../services/apiClient';
import type { Category } from '../types/types';
import CategoryItem from '../components/CategoryItem';
import Skeleton from 'react-loading-skeleton';
import {
  FolderTree,
  Layers,
  AlertCircle
} from 'lucide-react';
import SEO from '../components/SEO';

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const [categoriesData, articlesData] = await Promise.all([
          getPaginatedCategories(),
          getPaginatedArticles('/articles/')
        ]);
        setCategories(categoriesData.results);
        setTotalArticles(articlesData.count);
      } catch (err) {
        setError('Unable to load category tree.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // --- LOADING STATE (Tree Pattern) ---
  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-12 animate-in fade-in duration-500">
        {/* Header Skeleton — mirrors actual header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="flex justify-center mb-6">
            <Skeleton width={64} height={64} borderRadius={16} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
          </div>
          <Skeleton width={260} height={36} className="mx-auto mb-3" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
          <Skeleton width={380} height={20} className="mx-auto" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
        </div>

        {/* Directory Card Skeleton */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-purple-900/5 border border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* Toolbar Skeleton */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <Skeleton width={16} height={16} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
              <Skeleton width={110} height={14} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
              <div className="ml-auto">
                <Skeleton width={80} height={22} borderRadius={6} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
              </div>
            </div>

            {/* Tree Items Skeleton */}
            <div className="p-6 md:p-8 space-y-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  {/* Parent category */}
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton width={20} height={20} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                    <Skeleton width={`${30 + i * 5}%`} height={22} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                    <div className="ml-auto">
                      <Skeleton width={24} height={18} borderRadius={6} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                    </div>
                  </div>
                  {/* Sub-categories with indentation */}
                  {i <= 2 && (
                    <div className="pl-8 space-y-2 border-l-2 border-gray-100 dark:border-gray-700 ml-[10px]">
                      <div className="flex items-center gap-2">
                        <Skeleton width={16} height={16} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                        <Skeleton width={`${20 + i * 3}%`} height={18} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                      </div>
                      {i === 1 && (
                        <div className="flex items-center gap-2">
                          <Skeleton width={16} height={16} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                          <Skeleton width="18%" height={18} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Failed to Load Index</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-12 animate-in fade-in duration-500">
      <SEO
        title="Categories"
        description="Explore our structured documentation by topic hierarchy."
      />

      {/* --- HEADER SECTION --- */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-6 shadow-sm hover:scale-110 transition-transform duration-300">
          <FolderTree className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          Knowledge Index
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Explore our structured documentation by topic hierarchy.
        </p>
      </div>

      {/* --- MAIN CONTENT (Directory Card) --- */}
      <div className="max-w-5xl mx-auto">
        {categories.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-purple-900/5 border border-gray-200 dark:border-gray-700 overflow-hidden">

            {/* Card Header / Toolbar */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
               <Layers className="w-4 h-4 text-gray-400" />
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                 Root Directory
               </span>
               <span className="ml-auto text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-0.5 rounded-md font-medium">
                 {totalArticles} Articles
               </span>
            </div>

            {/* Recursive List Wrapper */}
            <div className="p-6 md:p-8">
              <ul className="space-y-1">
                {categories.map(category => (
                  <CategoryItem key={category.id} category={category} />
                ))}
              </ul>
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No categories defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;