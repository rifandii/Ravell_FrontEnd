import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../SidebarContext';
import { useGlobalData } from '../context/GlobalContext'; // <-- Import Global Data
import { 
  Hash, 
  Clock, 
  FileText, 
  List, 
  ChevronRight 
} from 'lucide-react';

const RightSidebar = () => {
  // [PERUBAHAN UTAMA]
  // Tidak ada lagi useState atau useEffect untuk fetch data.
  // Kita langsung ambil dari GlobalContext.
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
  
  // Skeleton loading kecil jika data global sedang diambil
  if (loading && !tags.length) {
    return (
      <aside className="hidden xl:block w-[320px] min-w-[320px] p-6 pl-0">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse h-64"></div>
      </aside>
    );
  }

  // --- Components Render ---

  const RecentArticlesWidget = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
          Fresh Updates
        </h3>
      </div>
      <ul className="space-y-4">
        {latestArticles.map((article) => (
          <li key={article.id} className="group">
            <Link to={`/articles/${article.slug}`} className="block">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-relaxed mb-1">
                {article.title}
              </h4>
              <div className="flex items-center text-xs text-gray-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-2 group-hover:translate-x-0 duration-300">
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <Hash className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
          Popular Topics
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            to={`/articles?tags__slug=${tag.slug}&tag_name=${tag.name}`}
            className="
              text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200
              bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700
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
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <List className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-wider">
          On This Page
        </h3>
      </div>
      
      {headings && headings.length > 0 ? (
        <nav className="relative">
          <div className="absolute left-[5px] top-2 bottom-2 w-[1px] bg-gray-100 dark:bg-gray-800"></div>
          
          <ul className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => handleScrollTo(heading.id)}
                  className={`
                    text-left w-full block py-1.5 pl-4 pr-2 text-sm transition-all duration-200 border-l-2
                    ${heading.level === "h2" 
                      ? "font-medium text-gray-700 dark:text-gray-200 border-transparent hover:border-gray-300 dark:hover:border-gray-600" 
                      : "text-xs text-gray-500 dark:text-gray-400 ml-1 border-transparent hover:text-gray-900 dark:hover:text-gray-200"
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
        <div className="text-center py-8 text-gray-400 dark:text-gray-600">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No headings found</p>
        </div>
      )}
    </div>
  );

  return (
    <aside className="hidden xl:block w-[320px] min-w-[320px] p-6 pl-0">
      {isArticleDetailPage ? (
        <div className="flex flex-col gap-6 h-full">
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <RecentArticlesWidget />
            <TrendingTagsWidget />
          </div>
          <div className="sticky top-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            <TableOfContentsWidget />
          </div>
        </div>
      ) : (
        <div className="sticky top-24 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <RecentArticlesWidget />
          <TrendingTagsWidget />
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;