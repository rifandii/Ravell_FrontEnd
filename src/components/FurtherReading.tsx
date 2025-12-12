// src/components/FurtherReading.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  BookOpen,
  Calendar
} from 'lucide-react';

// --- Types ---
interface NavArticle {
    title: string;
    slug: string;
}

interface Article {
    id: number;
    title: string;
    slug: string;
    published_date: string;
    // Tambahkan field lain jika API mengembalikan category/tags
}

interface FurtherReadingProps {
    currentArticleSlug: string;
    previousArticle: NavArticle | null;
    nextArticle: NavArticle | null;
}

// Sebaiknya URL ini dipindah ke env variable di real app
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const FurtherReading = ({ currentArticleSlug, previousArticle, nextArticle }: FurtherReadingProps) => {
    const [randomArticles, setRandomArticles] = useState<Article[]>([]);
    
    useEffect(() => {
        const fetchRandom = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/articles/random_articles/?exclude_slug=${currentArticleSlug}`);
                setRandomArticles(response.data);
            } catch (err) {
                console.error('Error fetching recommended articles:', err);
            }
        };
        
        if (currentArticleSlug) {
            fetchRandom();
        }
    }, [currentArticleSlug]);
    
    // Jangan render apa-apa jika tidak ada data navigasi sama sekali
    if (!randomArticles.length && !previousArticle && !nextArticle) {
        return null;
    }

    return (
        <section className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-800">
            
            {/* --- BAGIAN 1: LINEAR NAVIGATION (PREV/NEXT) --- */}
            <div className="mb-16">
                <h3 className="sr-only">Post Navigation</h3> {/* Screen Reader Only */}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Previous Article Card */}
                    {previousArticle ? (
                        <Link 
                            to={`/articles/${previousArticle.slug}`}
                            className="group flex flex-col p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform duration-300" />
                                Previous Article
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                {previousArticle.title}
                            </span>
                        </Link>
                    ) : (
                        // Empty placeholder agar layout grid tetap rapi jika hanya ada Next
                        <div className="hidden md:block"></div>
                    )}

                    {/* Next Article Card */}
                    {nextArticle ? (
                        <Link 
                            to={`/articles/${nextArticle.slug}`}
                            className="group flex flex-col items-end text-right p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Next Article
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                {nextArticle.title}
                            </span>
                        </Link>
                    ) : (
                        <div className="hidden md:block"></div>
                    )}
                </div>
            </div>

            {/* --- BAGIAN 2: DISCOVERY (RANDOM ARTICLES) --- */}
            {randomArticles.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-8">
                        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            You Might Also Like
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {randomArticles.map((article) => (
                            <Link 
                                key={article.id} 
                                to={`/articles/${article.slug}`} 
                                className="group flex flex-col h-full bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md transition-all duration-300"
                            >
                                {/* Icon Decorative */}
                                <div className="mb-4">
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                </div>

                                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {article.title}
                                </h4>
                                
                                <div className="mt-auto pt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-3 h-3 mr-1.5" />
                                    {new Date(article.published_date).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default FurtherReading;