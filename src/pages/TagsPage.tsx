// src/pages/TagsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPaginatedTags } from '../services/apiClient';
import type { Tag } from '../types/types';
import Skeleton from 'react-loading-skeleton';
import { 
  Hash, 
  FileText, 
  AlertCircle, 
  Tag as TagIcon 
} from 'lucide-react';

const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const data = await getPaginatedTags();
        setTags(data.results);
      } catch (err) {
        setError('Unable to load topic tags.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-12">
        <div className="flex flex-col items-center mb-12">
           <Skeleton width={64} height={64} circle className="mb-4" />
           <Skeleton width={200} height={40} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-40 flex flex-col justify-between">
                <Skeleton width={40} height={40} circle />
                <div>
                  <Skeleton width="60%" height={24} className="mb-2" />
                  <Skeleton width="30%" height={16} />
                </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Failed to Load Tags</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-12 animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mb-6 shadow-sm hover:rotate-12 transition-transform duration-300">
          <Hash className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          All Topics
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Browse articles by specific keywords and technical concepts.
        </p>
      </div>

      {/* --- TAGS GRID --- */}
      <div className="max-w-7xl mx-auto">
        {tags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tags.map(tag => (
              <Link
                key={tag.id}
                to={`/articles?tags__slug=${tag.slug}&tag_name=${tag.name}`}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Background Decoration (# Watermark) */}
                <div className="absolute -right-6 -top-6 text-9xl font-black text-gray-50 dark:text-gray-700/20 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none select-none font-sans">
                  #
                </div>

                <div className="relative z-10 flex flex-col h-full justify-between min-h-[100px]">
                  {/* Top: Icon */}
                  <div className="mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                      <TagIcon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Bottom: Content */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tag.name}
                    </h2>
                    
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {tag.post_count} {tag.post_count === 1 ? 'article' : 'articles'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <Hash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No tags found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;