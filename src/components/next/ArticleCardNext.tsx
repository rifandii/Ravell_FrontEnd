import Link from 'next/link';
import type { Article } from '../../types/types';
import ReactMarkdown from 'react-markdown';
import { Calendar, User, ArrowRight, Hash } from 'lucide-react';
import dayjs from 'dayjs';

interface ArticleCardProps {
  article: Article;
  showThumbnail?: boolean;
}

const ArticleCardNext = ({ article, showThumbnail = true }: ArticleCardProps) => {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-4 focus-visible:ring-offset-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-purple-900/70 dark:focus-visible:ring-offset-gray-950"
    >
      {showThumbnail && article.featured_image_url && (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800">
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-col flex-grow p-4 sm:p-6">
        <div className="mb-3 flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <time dateTime={article.published_date}>
              {dayjs(article.published_date).format('MMM D, YYYY')}
            </time>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-[100px]">{article.author_username}</span>
          </div>
        </div>

        <h2 className="mb-3 line-clamp-2 text-base font-bold leading-tight text-gray-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400 sm:text-lg md:text-xl">
          {article.title}
        </h2>

        <div className="prose prose-sm dark:prose-invert max-w-none mb-4 text-gray-600 dark:text-gray-400 leading-relaxed text-sm line-clamp-3">
          <ReactMarkdown allowedElements={['p', 'strong', 'em']}>
            {article.summary}
          </ReactMarkdown>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 overflow-hidden h-6">
              {article.tags.slice(0, 2).map(tag => (
                <span
                  key={tag.id}
                  className="flex items-center text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md"
                >
                  <Hash className="w-2.5 h-2.5 mr-0.5 text-gray-400" />
                  {tag.name}
                </span>
              ))}
              {article.tags.length > 2 && (
                <span className="text-[10px] text-gray-400 py-1 px-1">
                  +{article.tags.length - 2}
                </span>
              )}
            </div>

            <div className="flex translate-x-[-10px] items-center gap-1 text-sm font-semibold text-purple-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 dark:text-purple-400">
              Read
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCardNext;
