import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../SidebarContext';
import { useGlobalData } from '../context/GlobalContext';
import { 
  Hash, 
  Clock, 
  FileText, 
  List,
  ChevronRight 
} from 'lucide-react';

const RightSidebar = () => {
  const { tags, recentArticles: latestArticles, loading } = useGlobalData();
  const location = useLocation();
  const { headings } = useSidebar();
  const isArticleDetailPage = location.pathname.startsWith('/articles/') && headings.length > 0;

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };
  
  // Skeleton loading jika data global sedang diambil
  if (loading && !tags.length) {
    return (
      <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
        <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center shrink-0">
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-6 flex-grow">
          <div className="space-y-3">
            <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="w-full h-8 bg-gray-150 dark:bg-gray-800/50 rounded-xl animate-pulse"></div>
            <div className="w-full h-8 bg-gray-150 dark:bg-gray-800/50 rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="w-20 h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div className="flex flex-wrap gap-2">
              <div className="w-16 h-6 bg-gray-150 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
              <div className="w-12 h-6 bg-gray-150 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
              <div className="w-20 h-6 bg-gray-150 dark:bg-gray-800/50 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // --- Components Render ---

  const RecentArticlesWidget = () => (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-xs text-gray-950 dark:text-gray-200 uppercase tracking-wider">
          Fresh Updates
        </h3>
      </div>
      <ul className="space-y-4">
        {latestArticles.map((article) => (
          <li key={article.id} className="group">
            <Link to={`/articles/${article.slug}`} className="block cursor-pointer">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed mb-1">
                {article.title}
              </h4>
              <div className="flex items-center text-xs text-gray-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span>Read article</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const TrendingTagsWidget = () => (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <h3 className="font-bold text-xs text-gray-950 dark:text-gray-200 uppercase tracking-wider">
          Popular Topics
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            to={`/articles?tags__slug=${tag.slug}&tag_name=${tag.name}`}
            className="
              text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer
              bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-750
              hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 
              dark:hover:bg-blue-900/20 dark:hover:text-blue-300 dark:hover:border-blue-800
            "
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );

  const TableOfContentsWidget = () => (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-xs text-gray-950 dark:text-gray-200 uppercase tracking-wider">
          On This Page
        </h3>
      </div>
      {headings && headings.length > 0 ? (
        <nav className="relative">
          <div className="absolute left-[5px] top-2 bottom-2 w-[1px] bg-gray-150 dark:bg-gray-800"></div>
          
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => handleScrollTo(heading.id)}
                  className={`
                    text-left w-full block py-1.5 pl-4 pr-2 text-xs transition-all duration-200 border-l-2 cursor-pointer
                    ${heading.level === "h2" 
                      ? "font-medium text-gray-700 dark:text-gray-200 border-transparent hover:border-gray-300 dark:hover:border-gray-600" 
                      : "text-[11px] text-gray-500 dark:text-gray-400 ml-1 border-transparent hover:text-gray-900 dark:hover:text-gray-200"
                    }
                    hover:text-blue-600 dark:hover:text-blue-400
                    focus:outline-none focus:text-blue-600 dark:focus:text-blue-400
                  `}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <div className="text-center py-6 text-gray-450 dark:text-gray-550">
          <FileText className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No headings found</p>
        </div>
      )}
    </div>
  );

  return (
    <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
      {/* Header Panel Kanan */}
      <div className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center shrink-0">
        <span className="font-bold text-xs text-gray-900 dark:text-white tracking-wider uppercase">
          Discover
        </span>
      </div>

      {/* Konten Widget Panel Kanan */}
      <div className="flex-1 flex flex-col divide-y divide-gray-150 dark:divide-gray-800/60">
        {isArticleDetailPage ? (
          <>
            <div className="p-6">
              <RecentArticlesWidget />
            </div>
            <div className="p-6">
              <TrendingTagsWidget />
            </div>
            <div className="p-6">
              <TableOfContentsWidget />
            </div>
          </>
        ) : (
          <>
            <div className="p-6">
              <RecentArticlesWidget />
            </div>
            <div className="p-6">
              <TrendingTagsWidget />
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default RightSidebar;