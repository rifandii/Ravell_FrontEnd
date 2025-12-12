// src/components/ArticleCard.tsx
import { Link } from 'react-router-dom';
import type { Article } from '../types/types';
import ReactMarkdown from 'react-markdown';
import { Calendar, User, ArrowRight, Hash } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  // Kita menghapus logic isExpanded yang kompleks.
  // Filosofi UX: Card adalah "Teaser". Klik card = Baca full article.
  
  return (
    <Link 
      to={`/articles/${article.slug}`} 
      className="group flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1"
    >
      {/* --- 1. FEATURED IMAGE --- */}
      
      
      {/* --- 2. CONTENT BODY --- */}
      <div className="flex flex-col flex-grow p-6">
        
        {/* Metadata Row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={article.published_date}>
              {new Date(article.published_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </time>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{article.author_username}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
          {article.title}
        </h2>
        
        {/* Summary (Teaser) */}
        {/* Kita batasi markdown rendering untuk text only dan line-clamp */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-4 text-gray-600 dark:text-gray-400 leading-relaxed text-sm line-clamp-3">
          {/* allowedElements membatasi markdown agar tidak merender h1/img di preview */}
          <ReactMarkdown allowedElements={['p', 'strong', 'em']}>
            {article.summary}
          </ReactMarkdown>
        </div>

        {/* Spacer untuk mendorong footer ke bawah */}
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800/50">
          
          {/* Tags & CTA */}
          <div className="flex items-center justify-between gap-4">
            {/* Tags (Limit tampilkan 2 tag saja agar rapi) */}
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

            {/* Visual Cue "Read Article" */}
            <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 transform translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Read
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default ArticleCard;