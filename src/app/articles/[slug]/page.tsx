import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dayjs from 'dayjs';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import Breadcrumbs from './BreadcrumbsNext';
import FurtherReading from './FurtherReadingNext';
import ArticleDetailClient from './ArticleDetailClient';
import BackendUnavailable from '../../../components/BackendUnavailable';
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS, articleDetailTag } from '../../../lib/cachePolicy';
import { fetchBackendJson } from '../../../lib/backendFetch';
import { Calendar, User, Clock, Hash } from 'lucide-react';
import type { Article } from '../../../types/types';

declare const process: { env: { [key: string]: string | undefined } };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ravell.tech';

// This route owns article SSG: title, summary, metadata, and markdown body must
// be present in the initial HTML for search crawlers and social link previews.
async function getArticle(slug: string): Promise<Article | null> {
  return fetchBackendJson<Article>(
    `${API_BASE_URL}/api/articles/${slug}/`,
    {
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ARTICLES, articleDetailTag(slug)],
      }, // Revalidate article HTML/data hourly after build, with targeted on-demand tags.
    },
    { allowNotFound: true },
  );
}

// Pre-render known article slugs during the Vercel build.
export async function generateStaticParams() {
  try {
    const data = await fetchBackendJson<{ results?: Array<{ slug: string }> } | Array<{ slug: string }>>(`${API_BASE_URL}/api/articles/`, {
      next: { revalidate: CACHE_REVALIDATE_SECONDS, tags: [CACHE_TAGS.CONTENT, CACHE_TAGS.ARTICLES, CACHE_TAGS.ARTICLES_LIST] },
    });
    const articles = Array.isArray(data) ? data : data.results || [];
    return articles.map((article: { slug: string }) => ({
      slug: article.slug,
    }));
  } catch {
    // Build-time backend unavailability must not redefine runtime 404 semantics.
    return [];
  }
}

// Generate per-article metadata server-side so Telegram/Open Graph previews
// receive the same title and summary as the rendered article page.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let article: Article | null;
  try {
    article = await getArticle(slug);
  } catch {
    return {
      title: 'Content Temporarily Unavailable | Ravell Tech',
    };
  }
  if (!article) {
    return {
      title: 'Article Not Found | Ravell Tech',
    };
  }

  const title = `${article.title} | Ravell Tech`;
  const description = article.summary || `Read comprehensive guide about ${article.title}`;
  const imageUrl = article.featured_image_url || `${API_BASE_URL}/static/default-og.png`;

  return {
    title,
    description,
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://ravell.tech/articles/${article.slug}`,
      images: [{ url: imageUrl }],
      publishedTime: article.published_date,
      authors: [article.author_username],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let article: Article | null;
  try {
    article = await getArticle(slug);
  } catch {
    return <BackendUnavailable />;
  }
  if (!article) {
    notFound();
  }

  // Reading time is derived at render time so backend content edits stay reflected after ISR.
  const wordCount = article.markdown_content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="w-full pb-20 animate-in fade-in duration-500">
      {/* Client-only helper keeps TOC extraction and image lightbox out of the server component. */}
      <ArticleDetailClient article={article} />

      <header className="max-w-4xl mx-auto px-3 sm:px-4 md:px-8 pt-6 sm:pt-8 md:pt-12 mb-8 sm:mb-10 text-center">
        <div className="flex justify-center mb-6">
          <Breadcrumbs articleTitle={article.title} />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/articles?tags__slug=${encodeURIComponent(tag.slug)}&tag_name=${encodeURIComponent(tag.name)}`}
              className="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-300 hover:bg-purple-100 hover:text-purple-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:border-purple-600 dark:hover:bg-purple-900/50 dark:hover:text-purple-100"
            >
              <Hash className="w-3 h-3 mr-1" />
              {tag.name}
            </Link>
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
            <span>{readingTime} min read</span>
          </div>
        </div>
      </header>

      {article.featured_image_url && (
        <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-8 mb-8 sm:mb-12 md:mb-16">
          <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-purple-900/10 aspect-video">
            <img
              src={article.featured_image_url}
              alt={article.title}
              data-article-image="true"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
              tabIndex={0}
            />
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-8">
        <article className="prose prose-base md:prose-lg lg:prose-xl dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
          <MarkdownRenderer content={article.markdown_content} />
        </article>

        <div className="my-16 border-t border-gray-200 dark:border-gray-800" />

        <FurtherReading
          currentArticleSlug={article.slug}
          previousArticle={article.previous_article}
          nextArticle={article.next_article}
        />
      </main>
    </div>
  );
}
