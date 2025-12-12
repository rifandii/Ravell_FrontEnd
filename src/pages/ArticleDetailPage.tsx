// src/pages/ArticleDetailPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getArticleBySlug } from '../services/apiClient';
import type { Article, Heading } from '../types/types';
import { Helmet } from 'react-helmet-async'; // [SUDAH ADA]

// Markdown & Syntax Highlighting
import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import remarkGfm from 'remark-gfm';
import slugify from 'slugify';

// Components & Icons
import ImageModal from '../components/ImageModal';
import CopyButton from '../components/CopyButton';
import ScrollToTopButton from '../components/ScrollToTopButton';
import FurtherReading from '../components/FurtherReading';
import { useSidebar } from '../SidebarContext';
import Breadcrumbs from '../components/Breadcrumbs';
import Skeleton from 'react-loading-skeleton';
import { 
    Calendar, 
    User, 
    Clock, 
    Hash, 
    Terminal, 
    AlertCircle 
} from 'lucide-react';

const ArticleDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
    
    const markdownContainerRef = useRef<HTMLDivElement>(null);
    const { setHeadings, setPageTitle } = useSidebar();

    // ... (Logika Fetching & TOC tetap sama) ...
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

    // --- Custom Markdown Components (TETAP SAMA) ---
    const components: Components = {
        // ... (kode komponen Markdown Anda yang bagus tetap di sini) ...
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');
            const language = match ? match[1] : 'text';

            return !inline && match ? (
                <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-[#1e1e1e] shadow-lg">
                    <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <span className="ml-3 text-xs text-gray-400 font-mono flex items-center gap-1">
                                <Terminal className="w-3 h-3" />
                                {language}
                            </span>
                        </div>
                        <CopyButton text={codeText} />
                    </div>
                    <div className="text-sm">
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={language}
                            PreTag="div"
                            customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent' }}
                            {...props}
                        >
                            {codeText}
                        </SyntaxHighlighter>
                    </div>
                </div>
            ) : (
                <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 font-mono text-sm font-medium border border-gray-200 dark:border-gray-700" {...props}>
                    {children}
                </code>
            );
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        img({ ...props }: any) { 
            const isRelative = props.src && props.src.startsWith('/');
            const fullSrc = isRelative ? `http://127.0.0.1:8000${props.src}` : props.src;
            return (
                <figure className="my-8">
                    <img
                        {...props}
                        src={fullSrc}
                        className="w-full h-auto rounded-xl shadow-md cursor-zoom-in hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800"
                        onClick={() => setZoomedImageUrl(fullSrc || null)}
                        loading="lazy"
                    />
                    {props.alt && (
                        <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                            {props.alt}
                        </figcaption>
                    )}
                </figure>
            );
        },
        h2: ({ children }) => {
            const text = React.Children.toArray(children).join('');
            const id = slugify(text, { lower: true, strict: true });
            return (
                <h2 id={id} className="group flex items-center gap-2 text-2xl md:text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white scroll-mt-24">
                    {children}
                    <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 transition-opacity" aria-label="Link to this section">
                        #
                    </a>
                </h2>
            );
        },
        blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 my-6 rounded-r-lg text-gray-700 dark:text-gray-300 italic">
                {children}
            </blockquote>
        ),
    };

    // --- RENDER STATES ---
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
               {/* Skeleton tetap sama */}
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
        // Error state tetap sama
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Content Unavailable</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{error || "We couldn't find the article you're looking for."}</p>
                <button onClick={() => window.history.back()} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="w-full pb-20 animate-in fade-in duration-500">
            
            {/* --- [BARU] HELMET SEO IMPLEMENTATION --- */}
            <Helmet>
                {/* 1. Title Browser */}
                <title>{article.title} - Ravell Networks</title>
                
                {/* 2. Standard Meta */}
                <meta name="description" content={article.summary || `Read comprehensive guide about ${article.title}`} />
                <meta name="author" content={article.author_username} />
                
                {/* 3. Open Graph (Facebook/LinkedIn/WhatsApp) */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={article.title} />
                <meta property="og:description" content={article.summary || `Read comprehensive guide about ${article.title}`} />
                <meta property="og:url" content={window.location.href} />
                {article.featured_image_url && (
                    <meta property="og:image" content={article.featured_image_url} />
                )}
                
                {/* 4. Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={article.title} />
                <meta name="twitter:description" content={article.summary || `Read comprehensive guide about ${article.title}`} />
                {article.featured_image_url && (
                    <meta name="twitter:image" content={article.featured_image_url} />
                )}
            </Helmet>
            {/* -------------------------------------- */}

            {/* --- ARTICLE HEADER --- */}
            <header className="max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-12 mb-10 text-center">
                <div className="flex justify-center mb-6">
                    <Breadcrumbs articleTitle={article.title} />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {article.tags.map(tag => (
                        <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                            <Hash className="w-3 h-3 mr-1" />
                            {tag.name}
                        </span>
                    ))}
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
                    {article.title}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-gray-500 dark:text-gray-400 border-y border-gray-100 dark:border-gray-800 py-4">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-200">{article.author_username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <time dateTime={article.published_date}>
                            {new Date(article.published_date).toLocaleDateString('en-US', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                            })}
                        </time>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>5 min read</span>
                    </div>
                </div>
            </header>

            {/* --- FEATURED IMAGE --- */}
            {article.featured_image_url && (
                <div className="max-w-5xl mx-auto px-4 md:px-8 mb-12 md:mb-16">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 aspect-video group">
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

            {/* --- ARTICLE CONTENT --- */}
            <main className="max-w-4xl mx-auto px-4 md:px-8">
                <article 
                    ref={markdownContainerRef}
                    className="
                        prose prose-lg md:prose-xl dark:prose-invert max-w-none 
                        prose-headings:font-bold prose-headings:tracking-tight
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-img:rounded-xl prose-img:shadow-lg
                        text-gray-700 dark:text-gray-300 leading-relaxed
                    "
                >
                    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                        {article.markdown_content}
                    </ReactMarkdown>
                </article>

                {/* Divider */}
                <div className="my-16 border-t border-gray-200 dark:border-gray-800"></div>

                {/* --- FOOTER SECTION --- */}
                <FurtherReading 
                    currentArticleSlug={article.slug}
                    previousArticle={article.previous_article} 
                    nextArticle={article.next_article} 
                />
            </main>

            {/* --- UTILS --- */}
            <ImageModal
                imageUrl={zoomedImageUrl}
                onClose={() => setZoomedImageUrl(null)}
            />
            <ScrollToTopButton />
        </div>
    );
};

export default ArticleDetailPage;