// src/pages/ArticleDetailPage.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getArticleBySlug } from '../services/apiClient';
import type { Article, Heading } from '../types/types';
import { Helmet } from 'react-helmet-async';

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

    // --- Custom Markdown Components ---
    const components: Components = {
        // 1. Code Blocks (VS Code Terminal Style)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        code({ inline, className, children, ...props }: any) {
            // Deteksi bahasa (lebih toleran terhadap karakter seperti +, -)
            const match = /language-([^\s]+)/.exec(className || '');
            const language = match ? match[1] : 'text';
            const isBlockCode = !inline;

            // Normalisasi children jadi string dan bersihkan newline akhir
            const raw = React.Children.toArray(children).join('');
            let codeText = String(raw).replace(/\n$/, '');

            // Hapus backticks pembungkus hanya jika ada di awal & akhir
            if (codeText.length > 1 && codeText.startsWith('`') && codeText.endsWith('`')) {
                codeText = codeText.slice(1, -1);
            }

            if (isBlockCode) {
                return (
                    // [STYLE] Container VS Code
                    <div className="my-6 rounded-lg overflow-hidden border border-[#333] bg-[#1e1e1e] shadow-2xl relative group font-mono text-sm">
                        
                        {/* [HEADER] */}
                        <div className="flex items-center justify-between px-4 h-10 bg-[#252526] border-b border-[#1e1e1e] select-none">
                            <div className="flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-blue-400" />
                                {/* Tampilkan Bahasa (Uppercase) */}
                                <span className="text-xs text-gray-300 font-medium uppercase tracking-wider">
                                    {language}
                                </span>
                            </div>
                            
                            {/* Copy */}
                            <div className="flex items-center h-full relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={codeText} />
                            </div>
                        </div>
                        
                        {/* Code Content dengan nomor baris */}
                        <div className="overflow-x-auto">
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={language}
                                PreTag="div"
                                showLineNumbers
                                wrapLines
                                // Menata gaya nomor baris agar kontras & tidak mengganggu
                                lineNumberStyle={{
                                    minWidth: '2.25rem',
                                    paddingRight: '0.75rem',
                                    color: '#6b7280',
                                    background: 'transparent',
                                    userSelect: 'none',
                                    textAlign: 'right'
                                }}
                                customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent', fontSize: '0.9rem', lineHeight: '1.6' }}
                                {...props}
                            >
                                {codeText}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                );
            }

            // Inline Code -> gunakan codeText yang sudah dibersihkan
            return (
                <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-red-600 dark:text-red-400 font-mono text-sm font-medium" {...props}>
                    {codeText}
                </code>
            );
        },

        // 2. Images 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        img({ ...props }: any) { 
            const isRelative = props.src && props.src.startsWith('/');
            const fullSrc = isRelative ? `http://127.0.0.1:8000${props.src}` : props.src;
            return (
                <figure className="my-8">
                    <img
                        {...props}
                        src={fullSrc}
                        className="w-full h-auto rounded-lg shadow-md cursor-zoom-in hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800"
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
            <Helmet>
                <title>{article.title} - Ravell Networks</title>
                <meta name="description" content={article.summary || `Read comprehensive guide about ${article.title}`} />
                <meta name="author" content={article.author_username} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={article.title} />
                <meta property="og:description" content={article.summary || `Read comprehensive guide about ${article.title}`} />
                <meta property="og:url" content={window.location.href} />
                {article.featured_image_url && (
                    <meta property="og:image" content={article.featured_image_url} />
                )}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={article.title} />
                <meta name="twitter:description" content={article.summary || `Read comprehensive guide about ${article.title}`} />
                {article.featured_image_url && (
                    <meta name="twitter:image" content={article.featured_image_url} />
                )}
            </Helmet>

            <header className="max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-12 mb-10 text-center">
                <div className="flex justify-center mb-6">
                    <Breadcrumbs articleTitle={article.title} />
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {article.tags.map(tag => (
                        <span key={tag.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-[...]
                            <Hash className="w-3 h-3 mr-1" />
                            {tag.name}
                        </span>
                    ))}
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
                    {article.title}
                </h1>

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
            <ScrollToTopButton />
        </div>
    );
};

export default ArticleDetailPage;