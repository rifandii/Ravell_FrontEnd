// src/pages/HomePage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getLatestArticles,
  getPaginatedCategories,
  getPaginatedTags,
} from "../services/apiClient";
import type { Article, Category, Tag } from "../types/types";
import ArticleCard from "../components/ArticleCard";
import SkeletonCard from "../components/SkeletonCard";
import Skeleton from "react-loading-skeleton";
import SEO from "../components/SEO";

// Icons from Lucide React
import {
  ArrowRight,
  Star,
  Folder,
  Tag as TagIcon,
  MessageCircle,
  Zap,
  CalendarDays,
} from "lucide-react";

const HomePage = () => {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]); // Dummy for now
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articlesData, categoriesData, tagsData] = await Promise.all([
          getLatestArticles(), // Default fetch latest
          getPaginatedCategories(), // Fetches all categories
          getPaginatedTags(), // Fetches all tags
        ]);

        setLatestArticles(articlesData.slice(0, 6)); // Ambil 6 artikel terbaru
        // Dummy featured articles (Anda bisa ganti ini dengan logic dari backend)
        setFeaturedArticles(
          articlesData.filter((_, idx) => idx % 2 === 0).slice(0, 3)
        );
        setCategories(categoriesData.results.slice(0, 4)); // Ambil 4 kategori teratas
        setTags(tagsData.results.slice(0, 6)); // Ambil 6 tag teratas
      } catch (err) {
        console.error("Error fetching homepage data:", err);
        setError("Failed to load homepage content. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="w-full py-12 px-4 md:px-8 animate-in fade-in duration-500">
        {/* Hero Skeleton */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <Skeleton height={50} width="70%" className="mx-auto mb-4" />
          <Skeleton height={20} width="50%" className="mx-auto mb-8" />
          <Skeleton height={48} width="40%" className="mx-auto" />
        </div>

        {/* Featured Skeleton */}
        <div className="max-w-7xl mx-auto mb-16">
          <Skeleton height={30} width={250} className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        </div>

        {/* Recent Skeleton */}
        <div className="max-w-7xl mx-auto mb-16">
          <Skeleton height={30} width={200} className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonCard key={idx} />
            ))}
          </div>
        </div>

        {/* Explore Skeleton */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton height={30} width={150} />
            <Skeleton count={3} height={50} />
          </div>
          <div className="space-y-4">
            <Skeleton height={30} width={150} />
            <Skeleton count={3} height={50} />
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <Zap className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Houston, We Have a Problem!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <SEO 
        title="Home" 
        description="Your Hub for Networking & Security Insights. Dive into detailed articles, tutorials, and latest trends in networking and security." 
      />

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
                to="/articles"
                className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
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
                to="/articles"
                className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
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
              Find exactly what you need with our structured categories and
              detailed tags.
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
                    to={`/articles?category_name=${category.name}`}
                    className="flex items-center justify-between p-3 sm:p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md transition-all duration-300 group"
                  >
                    <span className="text-sm sm:text-base md:text-lg font-medium text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                      {category.name}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
                <Link
                  to="/categories"
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
                    to={`/articles?tags__slug=${tag.slug}&tag_name=${tag.name}`}
                    className="px-3 py-2 sm:px-5 sm:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-colors group"
                  >
                    #{tag.name}
                  </Link>
                ))}
                <Link
                  to="/tags"
                  className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium mt-2 ml-1"
                >
                  View All Tags <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS/QUOTES (Optional) --- */}
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
};

export default HomePage;
