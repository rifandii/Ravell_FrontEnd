import type { Metadata } from 'next';
import { FolderTree, Layers } from 'lucide-react';
import CategoryItemNext from '../../components/next/CategoryItemNext';
import BackendUnavailable from '../../components/BackendUnavailable';
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from '../../lib/cachePolicy';
import { fetchBackendJson } from '../../lib/backendFetch';
import type { Category } from '../../types/types';

declare const process: { env: { [key: string]: string | undefined } };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ravell.tech';

export const metadata: Metadata = {
  title: 'Categories | Ravell Tech',
  description: 'Explore our structured documentation by topic hierarchy.',
};

async function getCategoriesData() {
  try {
    // Keep category hierarchy and article count on the server-rendered page for fast index browsing.
    const [categoriesData, articlesData] = await Promise.all([
      fetchBackendJson<{ results?: Category[] }>(`${API_BASE_URL}/api/categories/`, { next: { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.CATEGORIES] } }),
      fetchBackendJson<{ count?: number }>(`${API_BASE_URL}/api/articles/`, { next: { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ARTICLES, CACHE_TAGS.ARTICLES_LIST] } }),
    ]);

    return {
      status: 'available' as const,
      categories: (categoriesData.results || []) as Category[],
      totalArticles: (articlesData.count || 0) as number,
    };
  } catch {
    return {
      status: 'unavailable' as const,
    };
  }
}

export default async function CategoriesPage() {
  const data = await getCategoriesData();

  if (data.status === 'unavailable') {
    return <BackendUnavailable />;
  }

  const { categories, totalArticles } = data;

  return (
    <div className="w-full px-4 md:px-8 py-12 animate-in fade-in duration-500">
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

      <div className="max-w-5xl mx-auto">
        {categories.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-purple-900/5 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
               <Layers className="w-4 h-4 text-gray-400" />
               <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                 Root Directory
               </span>
               <span className="ml-auto text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-0.5 rounded-md font-medium">
                 {totalArticles} Articles
               </span>
            </div>

            <div className="p-6 md:p-8">
              <ul className="space-y-1">
                {categories.map(category => (
                  <CategoryItemNext key={category.id} category={category} />
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No categories defined yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
