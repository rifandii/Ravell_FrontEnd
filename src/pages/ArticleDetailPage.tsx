// src/pages/ArticleDetailPage.tsx
import { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { getArticleBySlug } from '../services/apiClient';
import type { Article, Heading } from '../types/types';
import SEO from '../components/SEO';

// Markdown & Syntax Highlighting
import slugify from 'slugify';
import MarkdownRenderer from '../components/MarkdownRenderer';

// Components & Icons
import ImageModal from '../components/ImageModal';
import FurtherReading from '../components/FurtherReading';
import { useSidebar } from '../SidebarContext';
import Breadcrumbs from '../components/Breadcrumbs';
import Skeleton from 'react-loading-skeleton';
import { Calendar, User, Clock, Hash, AlertCircle } from 'lucide-react';

const ArticleDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
    
    const markdownContainerRef = useRef<HTMLDivElement>(null);
    const { setHeadings, setPageTitle } = useSidebar();

    // --- Fetching Logic ---
    useEffect(() => {
        setLoading(true);
        setArticle(null);
        setError(null);
        setHeadings([]);
        setPageTitle('');

        const fetchArticle = async () => {
            if (!slug) {
                setError('Article slug is missing.');
                setLoading(false);
                return;
            }
            try {
                const data = await getArticleBySlug(slug);
                if (data) {
                    setArticle(data);
                    setPageTitle(data.title); 
                } else {
                    setError('Article not found.');
                    setPageTitle('Article Not Found');
                }
            } catch (err) {
                console.error('Error fetching article details:', err);
                setError('Failed to fetch article. Server might be down.');
                setPageTitle('Error');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
        return () => {
            setHeadings([]); 
            setPageTitle('');
        }
    }, [slug, setHeadings, setPageTitle]);

    // --- TOC Extraction Logic ---
    useEffect(() => {
        if (markdownContainerRef.current && article) { 
            setTimeout(() => {
                if (!markdownContainerRef.current) return;
                const hTags = markdownContainerRef.current.querySelectorAll('h2, h3');
                const newHeadings: Heading[] = [];
                hTags.forEach(h => {
                    const text = h.textContent || '';
                    const id = h.id || slugify(text, { lower: true, strict: true });
                    h.id = id; 
                    newHeadings.push({
                        id: id,
                        text: text,
                        level: h.tagName.toLowerCase(),
                    });
                });
                setHeadings(newHeadings);
            }, 100);
        }
    }, [article, setHeadings]);

    // Custom Markdown Components removed and delegated to reusable <MarkdownRenderer />

    // --- RENDER STATES ---
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="space-y-4 mb-12 text-center">
                    <Skeleton width={150} height={20} className="mb-4" />
                    <Skeleton height={60} className="mb-4" />
                    <div className="flex justify-center gap-4">
                        <Skeleton width={100} />
                        <Skeleton width={100} />
                    </div>
                </div>
                <Skeleton height={400} borderRadius={24} className="mb-12" />
                <div className="space-y-6">
                     <Skeleton count={3} />
                     <Skeleton height={200} />
                     <Skeleton count={10} />
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Failed to Load Article</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mb-6">{error || "We couldn't find the article you're looking for."}</p>
                <button 
                    onClick={() => window.history.back()} 
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="w-full pb-20 animate-in fade-in duration-500">
            <SEO 
                title={article.title}
                description={article.summary || `Read comprehensive guide about ${article.title}`}
                type="article"
                image={article.featured_image_url || undefined}
                url={window.location.href}
            />

            <header className="max-w-4xl mx-auto px-3 sm:px-4 md:px-8 pt-6 sm:pt-8 md:pt-12 mb-8 sm:mb-10 text-center">
                <div className="flex justify-center mb-6">
                    <Breadcrumbs articleTitle={article.title} />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {article.tags.map(tag => (
                        <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800">
                            <Hash className="w-3 h-3 mr-1" />
                            {tag.name}
                        </span>
                    ))}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
                    {article.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-gray-500 dark:text-gray-400 border-y border-gray-100 dark:border-gray-800 py-4">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-200">{article.author_username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <time dateTime={article.published_date}>
                            {dayjs(article.published_date).format('MMMM D, YYYY')}
                        </time>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span>5 min read</span>
                    </div>
                </div>
            </header>

            {article.featured_image_url && (
                <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-8 mb-8 sm:mb-12 md:mb-16">
                    <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/10 aspect-video group">
                        <img
                            src={article.featured_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-105"
                            onClick={() => setZoomedImageUrl(article.featured_image_url || null)}
                            loading="eager"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            )}

            <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-8">
                <article 
                    ref={markdownContainerRef}
                    className="
                        prose prose-base md:prose-lg lg:prose-xl dark:prose-invert max-w-none 
                        prose-headings:font-bold prose-headings:tracking-tight
                        prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-xl prose-img:shadow-lg
                        text-gray-700 dark:text-gray-300 leading-relaxed
                    "
                >
                    <MarkdownRenderer 
                        content={article.markdown_content} 
                        onImageClick={(src) => setZoomedImageUrl(src)}
                    />
                </article>

                <div className="my-16 border-t border-gray-200 dark:border-gray-800"></div>

                <FurtherReading 
                    currentArticleSlug={article.slug}
                    previousArticle={article.previous_article} 
                    nextArticle={article.next_article} 
                />
            </main>

            <ImageModal
                imageUrl={zoomedImageUrl}
                onClose={() => setZoomedImageUrl(null)}
            />
        </div>
    );
};

export default ArticleDetailPage;