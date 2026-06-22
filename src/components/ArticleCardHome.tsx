import { Link } from 'react-router-dom';
import type { Article } from '../types/types';
import ReactMarkdown from 'react-markdown'; // <-- 1. IMPORT ReactMarkdown
import remarkGfm from 'remark-gfm'; // Opsional: untuk GFM (tabel, dll.)
import dayjs from 'dayjs';

interface ArticleCardProps {
  article: Article;
}

const ArticleCardHome = ({ article }: ArticleCardProps) => {
  return (
    <Link 
      to={`/articles/${article.slug}`}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden 
                 transform transition-all duration-300 ease-in-out
                 hover:shadow-2xl hover:-translate-y-1 group h-full flex flex-col"
    >
      {article.featured_image_url && (
        <div className="overflow-hidden"> {/* Wrapper untuk zoom gambar */}
          <img
            src={article.featured_image_url}
            alt={article.title}
            // [PERBAIKAN 2] Buat gambar sedikit zoom saat di-hover
            className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      
      {/* Wrapper konten dibuat flex-col agar footer (tags) bisa 'menempel' di bawah */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Judul */}
        <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-gray-200 
                       group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
          {article.title}
        </h2>
        
        {/* Metadata */}
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
          Published on {dayjs(article.published_date).format('MMM D, YYYY')} by {article.author_username}
        </p>
        
        {/* [PERBAIKAN 3] Ganti <p> dengan ReactMarkdown */}
        <div 
          className="prose prose-sm dark:prose-invert max-w-none 
                     text-gray-700 dark:text-gray-300 
                     mb-4 line-clamp-3" // <-- 'line-clamp-3' membatasi 3 baris
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.summary}
          </ReactMarkdown>
        </div>
        
        {/* Tags (didorong ke bawah dengan 'mt-auto') */}
        <div className="mt-auto flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <span 
              key={tag.id} 
              className="bg-purple-100 text-purple-800 px-3 py-1 text-xs font-semibold rounded-full dark:bg-purple-900 dark:text-purple-300"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default ArticleCardHome;