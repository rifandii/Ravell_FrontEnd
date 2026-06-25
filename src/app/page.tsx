import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Star, Folder, Tag as TagIcon, MessageCircle, Zap, CalendarDays } from 'lucide-react';
import ArticleCardNext from '../components/next/ArticleCardNext';
import type { Article, Category, Tag } from '../types/types';

declare const process: { env: { [key: string]: string | undefined } };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ravell.tech';

export const metadata: Metadata = {
  title: 'Home | Ravell Tech',
  description: 'Your Hub for Networking & Security Insights. Dive into detailed articles, tutorials, and latest trends in networking and security.',
};

async function getHomeData() {
  try {
    const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/articles/latest/`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE_URL}/api/categories/`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE_URL}/api/tags/`, { next: { revalidate: 3600 } }),
    ]);

    const latestArticles: Article[] = articlesRes.ok ? await articlesRes.json() : [];
    const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { results: [] };
    const tagsData = tagsRes.ok ? await tagsRes.json() : { results: [] };

    return {
      latestArticles: latestArticles.slice(0, 6),
      featuredArticles: latestArticles.filter((_, idx) => idx % 2 === 0).slice(0, 3),
      categories: (categoriesData.results || []).slice(0, 4) as Category[],
      tags: (tagsData.results || []).slice(0, 6) as Tag[],
      error: null
    };
  } catch (err) {
    console.error('Error fetching homepage data:', err);
    return {
      latestArticles: [],
      featuredArticles: [],
      categories: [],
      tags: [],
      error: 'Failed to load homepage content. Please try again later.'
    };
  }
}

export default async function HomePage() {
  const { latestArticles, featuredArticles, categories, tags, error } = await getHomeData();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Failed to Load Homepage
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mb-6">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* --- FEATURED ARTICLES --- */}
      {featuredArticles.length > 0 && (
        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
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
            — Some IT Guy.
          </p>
        </div>
      </section>
    </div>
  );
}
