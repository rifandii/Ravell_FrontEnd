// src/pages/HomePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLatestArticles, getPaginatedCategories, getPaginatedTags } from '../services/apiClient';
import type { Article, Category, Tag } from '../types/types';
import ArticleCard from '../components/ArticleCard';
import SkeletonCard from '../components/SkeletonCard';
import Skeleton from 'react-loading-skeleton';

// Icons from Lucide React
import {
  ArrowRight, 
  Star,
  Folder, 
  Tag as TagIcon, 
  MessageCircle, 
  Zap,
  LayoutDashboard,
  CalendarDays 
} from 'lucide-react';

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
        const [
          articlesData, 
          categoriesData, 
          tagsData
        ] = await Promise.all([
          getLatestArticles(), // Default fetch latest
          getPaginatedCategories(), // Fetches all categories
          getPaginatedTags() // Fetches all tags
        ]);

        setLatestArticles(articlesData.slice(0, 6)); // Ambil 6 artikel terbaru
        // Dummy featured articles (Anda bisa ganti ini dengan logic dari backend)
        setFeaturedArticles(articlesData.filter((_, idx) => idx % 2 === 0).slice(0, 3)); 
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
            {Array.from({ length: 3 }).map((_, idx) => <SkeletonCard key={idx} />)}
          </div>
        </div>

        {/* Recent Skeleton */}
        <div className="max-w-7xl mx-auto mb-16">
          <Skeleton height={30} width={200} className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => <SkeletonCard key={idx} />)}
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
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Houston, We Have a Problem!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* --- HERO SECTION: COMMAND CENTER --- */}
      <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950/30 text-center">
        {/* Background Dot Grid */}
        <div className="absolute inset-0 z-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23a0a0a0\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>
        {/* Background Gradient Blob (Styling ini bisa dibuat di global CSS atau disesuaikan) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-96 md:h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob delay-700"></div>
        <div className="absolute top-1/4 right-1/4 w-60 h-60 bg-purple-400/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6 shadow-md animate-in fade-in zoom-in duration-700">
             <LayoutDashboard className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-top-4 duration-700">
            Your Hub for Cybersecurity Insights
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Dive into detailed articles, tutorials, and latest trends in network security, ethical hacking, and digital forensics.
          </p>
          
          <Link
            to="/articles" // Link ke halaman artikel list
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-800/40 transition-all duration-300 transform hover:-translate-y-1 animate-in fade-in zoom-in duration-700 delay-300"
          >
            Explore All Articles
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* --- FEATURED ARTICLES --- */}
      {featuredArticles.length > 0 && (
        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between mb-10 md:mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Star className="w-7 h-7 text-yellow-500" />
                Featured Content
              </h2>
              <Link to="/articles" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArticles.map(article => (
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CalendarDays className="w-7 h-7 text-blue-600" />
                Latest Updates
              </h2>
              <Link to="/articles" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline font-medium">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- EXPLORE BY TOPICS --- */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Explore by Topics</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Find exactly what you need with our structured categories and detailed tags.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Categories */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Folder className="w-6 h-6 text-indigo-600" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Categories</h3>
              </div>
              <div className="space-y-4">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    to={`/articles?category_name=${category.name}`}
                    className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-300 group"
                  >
                    <span className="text-lg font-medium text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {category.name}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
                <Link to="/categories" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium mt-4">
                  View All Categories <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <TagIcon className="w-6 h-6 text-teal-600" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Popular Tags</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {tags.map(tag => (
                  <Link
                    key={tag.id}
                    to={`/articles?tags__slug=${tag.slug}&tag_name=${tag.name}`}
                    className="px-5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
                  >
                    #{tag.name}
                  </Link>
                ))}
                <Link to="/tags" className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline font-medium mt-2 ml-1">
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
          <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-6" />
          <p className="text-xl md:text-2xl italic font-serif text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            "This blog has become my go-to resource for staying ahead in cybersecurity. The articles are incredibly detailed and always up-to-date with the latest threats and defenses."
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            — Alex R., Network Security Engineer
          </p>
        </div>
      </section>

    </div>
  );
};

export default HomePage;