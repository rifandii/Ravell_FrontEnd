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
import { Calendar, User, Clock, Hash, Terminal, AlertCircle } from 'lucide-react';

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const codeText = String(children).replace(/\n$/, '');
      const language = match ? match[1] : 'text';

      return !inline && match ? (
        <div className="relative group my-4">
          {/* Language Badge & Copy Button */}
          <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 px-4 py-2 rounded-t-lg border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-mono text-gray-400 uppercase">
                {language}
              </span>
            </div>
            <CopyButton text={codeText} />
          </div>
          
          {/* Code Block */}
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            className="!mt-0 !rounded-t-none !rounded-b-lg"
            customStyle={{
              margin: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
            {...props}
          >
            {codeText}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code 
          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-rose-600 dark:text-rose-400 rounded text-[0.9em] font-mono border border-gray-200 dark:border-gray-700"
          {...props}
        >
          {children}
        </code>
      );
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    img({ ...props }: any) {
      const isRelative = props.src && props.src.startsWith('/');
      const fullSrc = isRelative ? `http://127.0.0.1:8000${props.src}` : props.src;
      return (
        <figure className="my-6">
          <img
            src={fullSrc}
            alt={props.alt || 'Article image'}
            className="rounded-lg shadow-md w-full cursor-zoom-in hover:opacity-90 transition-opacity"
            onClick={() => setZoomedImageUrl(fullSrc || null)}
            loading="lazy"
          />
          {props.alt && (
            <figcaption className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
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
        <h2
          id={id}
          className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4 scroll-mt-20"
        >
          {children}
        </h2>
      );
    },

    h3: ({ children }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text, { lower: true, strict: true });
      return (
        <h3
          id={id}
          className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-3 scroll-mt-20"
        >
          {children}
        </h3>
      );
    },

    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 my-4 italic text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-950/30 py-2 rounded-r">
        {children}
      </blockquote>
    ),

    p: ({ children }) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
        {children}
      </p>
    ),

    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
        {children}
      </ul>
    ),

    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4 ml-4">
        {children}
      </ol>
    ),

    li: ({ children }) => (
      <li className="ml-2">{children}</li>
    ),

    a: ({ href, children }) => (
      <a
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    strong: ({ children }) => (
      <strong className="font-bold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),

    em: ({ children }) => (
      <em className="italic text-gray-800 dark:text-gray-200">
        {children}
      </em>
    ),

    hr: () => (
      <hr className="my-8 border-gray-300 dark:border-gray-700" />
    ),

    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
          {children}
        </table>
      </div>
    ),

    thead: ({ children }) => (
      <thead className="bg-gray-100 dark:bg-gray-800">
        {children}
      </thead>
    ),

    th: ({ children }) => (
      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold">
        {children}
      </th>
    ),

    td: ({ children }) => (
      <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">
        {children}
      </td>
    ),
  };

  // --- RENDER STATES ---
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton height={40} width="60%" className="mb-4" />
        <Skeleton height={20} width="40%" className="mb-8" />
        <Skeleton height={300} className="mb-6" />
        <Skeleton count={10} className="mb-2" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Content Unavailable
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          {error || "We couldn't find the article you're looking for."}
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* --- HELMET SEO IMPLEMENTATION --- */}
      <Helmet>
        {/* 1. Title Browser */}
        <title>{article.title} | Your Blog Name</title>
        
        {/* 2. Standard Meta */}
        <meta name="description" content={article.meta_description || article.title} />
        <meta name="keywords" content={article.tags.map(t => t.name).join(', ')} />
        <meta name="author" content={article.author_username} />
        
        {/* 3. Open Graph (Facebook/LinkedIn/WhatsApp) */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.meta_description || article.title} />
        <meta property="og:url" content={`https://yourdomain.com/articles/${article.slug}`} />
        {article.featured_image_url && (
          <meta property="og:image" content={article.featured_image_url} />
        )}
        
        {/* 4. Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.meta_description || article.title} />
        {article.featured_image_url && (
          <meta name="twitter:image" content={article.featured_image_url} />
        )}
      </Helmet>

      {/* --- ARTICLE HEADER --- */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
            >
              <Hash className="w-3 h-3" />
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
          {article.title}
        </h1>

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="font-medium">{article.author_username}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={article.published_date}>
              {new Date(article.published_date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>5 min read</span>
          </div>
        </div>

        {/* --- FEATURED IMAGE --- */}
        {article.featured_image_url && (
          <figure className="mb-10 -mx-4 sm:mx-0">
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="w-full rounded-none sm:rounded-xl shadow-lg cursor-zoom-in hover:opacity-95 transition-opacity"
              onClick={() => setZoomedImageUrl(article.featured_image_url || null)}
              loading="eager"
            />
          </figure>
        )}

        {/* --- ARTICLE CONTENT --- */}
        <div
          ref={markdownContainerRef}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={components}
          >
            {article.markdown_content}
          </ReactMarkdown>
        </div>

        {/* Divider */}
        <hr className="my-12 border-gray-300 dark:border-gray-700" />

        {/* --- FOOTER SECTION --- */}
        <FurtherReading currentSlug={slug || ''} />
      </article>

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