import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dayjs from 'dayjs';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import Breadcrumbs from './BreadcrumbsNext';
import FurtherReading from './FurtherReadingNext';
import ArticleDetailClient from './ArticleDetailClient';
import { Calendar, User, Clock, Hash } from 'lucide-react';
import type { Article } from '../../../types/types';

declare const process: { env: { [key: string]: string | undefined } };
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ravell.tech';

// This route owns article SSG: title, summary, metadata, and markdown body must
// be present in the initial HTML for search crawlers and social link previews.
async function getArticle(slug: string): Promise<Article | null> {
  try {
    const url = `${API_BASE_URL}/api/articles/${slug}/`;
    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Revalidate article HTML/data hourly after build.
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Error fetching article: ${slug}`, error);
    return null;
  }
}

// Pre-render known article slugs during the Vercel build.
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/articles/`);
    if (!res.ok) return [];
    const data = await res.json();
    const articles = Array.isArray(data) ? data : data.results || [];
    return articles.map((article: { slug: string }) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate per-article metadata server-side so Telegram/Open Graph previews
// receive the same title and summary as the rendered article page.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
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
  const article = await getArticle(slug);
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
            <span
              key={tag.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-100 dark:border-purple-800"
            >
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
              className="w-full h-full object-cover"
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
