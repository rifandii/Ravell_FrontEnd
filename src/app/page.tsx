import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star, Folder, Tag as TagIcon, MessageCircle, CalendarDays, BookOpen, Network, ShieldCheck } from 'lucide-react';
import ArticleCardNext from '../components/next/ArticleCardNext';
import BackendUnavailable from '../components/BackendUnavailable';
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from '../lib/cachePolicy';
import { fetchBackendJson } from '../lib/backendFetch';
import type { Article, Category, Tag } from '../types/types';

declare const process: { env: { [key: string]: string | undefined } };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ravell.tech';

// Home is a server component with ISR-backed data so the first response is real
// HTML instead of an empty SPA shell.
export const metadata: Metadata = {
  title: 'Home | Ravell Tech',
  description: 'Your Hub for Networking & Security Insights. Dive into detailed articles, tutorials, and latest trends in networking and security.',
};

async function getHomeData() {
  try {
    // Fetch the homepage data in parallel; each request participates in Next ISR.
    const [latestArticles, categoriesData, tagsData] = await Promise.all([
      fetchBackendJson<Article[]>(`${API_BASE_URL}/api/articles/latest/`, { next: { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ARTICLES, CACHE_TAGS.ARTICLES_LATEST] } }),
      fetchBackendJson<{ results?: Category[] }>(`${API_BASE_URL}/api/categories/`, { next: { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.CATEGORIES] } }),
      fetchBackendJson<{ results?: Tag[] }>(`${API_BASE_URL}/api/tags/`, { next: { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.TAGS] } }),
    ]);

    return {
      status: 'available' as const,
      latestArticles: latestArticles.slice(0, 6),
      featuredArticles: latestArticles.filter((_, idx) => idx % 2 === 0).slice(0, 3),
      categories: (categoriesData.results || []).slice(0, 4) as Category[],
      tags: (tagsData.results || []).slice(0, 6) as Tag[],
      error: null
    };
  } catch {
    return {
      status: 'unavailable' as const,
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  if (data.status === 'unavailable') {
    return <BackendUnavailable />;
  }

  const { latestArticles, featuredArticles, categories, tags } = data;

  return (
    <div className="w-full animate-in fade-in duration-500">
      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-14">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Network & Security Notes
            </div>

            <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-950 dark:text-white sm:text-5xl lg:text-6xl">
              Ravell Tech
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400 sm:text-lg">
              Practical field notes, architecture references, and troubleshooting guides for modern network and security operations.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-gray-950 dark:hover:bg-purple-200 dark:focus-visible:ring-offset-gray-900"
              >
                Browse Articles
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/tags"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-all duration-200 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-purple-800 dark:hover:bg-purple-900/20 dark:hover:text-purple-300 dark:focus-visible:ring-offset-gray-900"
              >
                Explore Topics
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
            <div className="border-r border-gray-200 p-4 dark:border-gray-800 sm:p-5">
              <BookOpen className="mb-4 h-5 w-5 text-purple-600 dark:text-purple-400" />
              <p className="text-2xl font-black text-gray-950 dark:text-white">{latestArticles.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Latest</p>
            </div>
            <div className="border-r border-gray-200 p-4 dark:border-gray-800 sm:p-5">
              <Folder className="mb-4 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-2xl font-black text-gray-950 dark:text-white">{categories.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Categories</p>
            </div>
            <div className="p-4 sm:p-5">
              <Network className="mb-4 h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <p className="text-2xl font-black text-gray-950 dark:text-white">{tags.length}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">Topics</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURED ARTICLES --- */}
      {featuredArticles.length > 0 && (
        <section className="py-12 md:py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                <Star className="w-5 h-5 sm:w-7 sm:h-7 text-yellow-500" />
                Featured Content
              </h2>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredArticles.map((article) => (
                <ArticleCardNext key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- RECENT ARTICLES --- */}
      {latestArticles.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-10 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                <CalendarDays className="w-5 h-5 sm:w-7 sm:h-7 text-purple-600" />
                Latest Updates
              </h2>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {latestArticles.map((article) => (
                <ArticleCardNext key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- EXPLORE BY TOPICS --- */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Explore by Topics
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400">
              Find exactly what you need with our structured categories and detailed tags.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Categories */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Folder className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                  Categories
                </h3>
              </div>
              <div className="space-y-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/articles?category_name=${category.name}`}
                    className="flex items-center justify-between p-3 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all duration-300 group"
                  >
                    <span className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {category.name}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium mt-4"
                >
                  View All Categories <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TagIcon className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                  Popular Tags
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/articles?tags__slug=${tag.slug}&tag_name=${tag.name}`}
                    className="px-3 py-2 sm:px-5 sm:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                  >
                    #{tag.name}
                  </Link>
                ))}
                <Link
                  href="/tags"
                  className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium mt-2 ml-1"
                >
                  View All Tags <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS/QUOTES --- */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
          <MessageCircle className="w-12 h-12 text-purple-500 mx-auto mb-6" />
          <p className="text-xl md:text-2xl italic font-serif text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            "The bad guys only need to be right once. The defender has to be right every single time."
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            - Some IT Guy.
          </p>
        </div>
      </section>
    </div>
  );
}
