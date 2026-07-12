'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { getPaginatedArticles, getTagBySlug, getCategoryBySlug } from '../../services/apiClient';
import BackendUnavailable from '../../components/BackendUnavailable';
import type { PaginatedResponse } from '../../services/apiClient';
import type { Article, Category, Tag } from '../../types/types';
import ArticleCardNext from '../../components/next/ArticleCardNext';
import PaginationNext from '../../components/next/PaginationNext';
import SkeletonCard from '../../components/SkeletonCard';
import {
  Search,
  FolderOpen,
  Hash,
  Calendar,
  BookOpen,
  XCircle,
  FileQuestion,
  AlertCircle
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// The listing stays client-rendered because search, filters, validation, and
// pagination are driven by URL query state after the static shell loads.
export default function ArticleListClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [validatedTagName, setValidatedTagName] = useState<string | null>(null);
  const [validatedCategoryName, setValidatedCategoryName] = useState<string | null>(null);
  const [isInvalidFilter, setIsInvalidFilter] = useState<boolean>(false);

  // Convert URL filters into the page heading and supporting context shown above the results.
  const pageContext = useMemo(() => {
    const categorySlug = searchParams.get('categories__slug');
    const tagSlug = searchParams.get('tags__slug');
    const categoryParam = searchParams.get('category_name');
    const tagParam = searchParams.get('tag_name');
    const search = searchParams.get('search');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (categorySlug || categoryParam) {
      const displayName = validatedCategoryName || categoryParam || categorySlug || '';
      return {
        title: displayName,
        subtitle: 'Category Archive',
        icon: FolderOpen,
        isFiltered: true
      };
    }
    if (tagSlug || tagParam) {
      const displayName = validatedTagName || tagParam || tagSlug || '';
      return {
        title: `#${displayName}`,
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
      let subtitle = `Archive from ${year}`;
      if (month) {
        const monthInt = parseInt(month, 10);
        if (monthInt >= 1 && monthInt <= 12) {
          subtitle = `Archive from ${MONTH_NAMES[monthInt - 1]} ${year}`;
        }
      }
      return {
        title: 'Time Capsule',
        subtitle: subtitle,
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
  }, [searchParams, validatedTagName, validatedCategoryName]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      const query = searchParams.toString();
      const tagSlug = searchParams.get('tags__slug');
      const categorySlug = searchParams.get('categories__slug');

      try {
        // Validate slug filters alongside the article query so bad tag/category URLs fail clearly.
        const promises: [Promise<PaginatedResponse<Article>>, Promise<Tag | null> | null, Promise<Category | null> | null] = [
          getPaginatedArticles(`/articles/?${query}`),
          tagSlug ? getTagBySlug(tagSlug) : null,
          categorySlug ? getCategoryBySlug(categorySlug) : null,
        ];

        const [articlesData, tagData, categoryData] = await Promise.all(promises);

        if (tagSlug) {
          if (tagData) {
            setIsInvalidFilter(false);
            setValidatedTagName(tagData.name);
          } else {
            setIsInvalidFilter(true);
            setLoading(false);
            return;
          }
        } else {
          setValidatedTagName(null);
        }

        if (categorySlug) {
          if (categoryData) {
            setIsInvalidFilter(false);
            setValidatedCategoryName(categoryData.name);
          } else {
            setIsInvalidFilter(true);
            setLoading(false);
            return;
          }
        } else {
          setValidatedCategoryName(null);
        }

        if (!tagSlug && !categorySlug) {
          setIsInvalidFilter(false);
        }

        setArticles(articlesData.results || []);
        setCount(articlesData.count || 0);
        setNextPageUrl(articlesData.next);
        setPrevPageUrl(articlesData.previous);

      } catch {
        setError('backend_unavailable');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // The API returns absolute pagination URLs; keep only query params before routing inside Next.
  const handlePageChange = (url: string | null) => {
    if (url) {
      const urlObj = new URL(url);
      const newParams = new URLSearchParams(urlObj.searchParams.toString());
      router.push(`${pathname}?${newParams.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Clear to the related index page instead of silently dropping users on a generic list.
  const clearFilters = () => {
    const categorySlug = searchParams.get('categories__slug');
    const categoryParam = searchParams.get('category_name');
    const tagSlug = searchParams.get('tags__slug');
    const tagParam = searchParams.get('tag_name');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (tagSlug || tagParam) {
      router.push('/tags');
    } else if (categorySlug || categoryParam) {
      router.push('/categories');
    } else if (year || month) {
      router.push('/archives');
    } else {
      router.push('/articles');
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-8">
        <div className="mb-12 text-center">
           <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-4 animate-pulse"></div>
           <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-full">
               <SkeletonCard showThumbnail={false} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <BackendUnavailable />;
  }

  if (isInvalidFilter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invalid Filter</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mb-6">
          The tag or category you are looking for doesn't exist or is invalid.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
          >
            Go Back
          </button>
          <Link
            href="/articles"
            className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            Browse Articles
          </Link>
        </div>
      </div>
    );
  }

  const Icon = pageContext.icon;
  const listVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.055,
      },
    },
  };
  const cardVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 14,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.32,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <div className="w-full px-4 md:px-8 py-8 min-h-screen animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-4 shadow-sm">
          <Icon className="w-6 h-6" />
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          {pageContext.title}
        </h1>

        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
          <span className="font-medium uppercase tracking-wide">{pageContext.subtitle}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{count} {count === 1 ? 'Result' : 'Results'}</span>
        </div>

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

      {articles.length > 0 ? (
        <div className="space-y-12">
          <motion.div
            key={searchParams.toString() || 'all-articles'}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8"
            initial="hidden"
            animate="visible"
            variants={listVariants}
          >
            {articles.map(article => (
              <motion.div key={article.id} className="h-full" variants={cardVariants}>
                <ArticleCardNext article={article} showThumbnail={false} />
              </motion.div>
            ))}
          </motion.div>

          {Math.ceil(count / 10) > 1 && (
            <div className="flex justify-center pt-8 border-t border-gray-100 dark:border-gray-800">
              <PaginationNext
                count={count}
                nextPageUrl={nextPageUrl}
                prevPageUrl={prevPageUrl}
                handlePageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      ) : (
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
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-600/20"
            >
              View All Articles
            </button>
            <Link
              href="/"
              className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
