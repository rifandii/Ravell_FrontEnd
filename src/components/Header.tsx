// src/components/Header.tsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import ReadingProgressBar from "./ReadingProgressBar";
import { useSidebar } from "../SidebarContext";
import { useGlobalData } from "../context/GlobalContext"; // [BARU] Import Context

// Menggunakan Lucide React agar konsisten dengan Sidebar/ArticleCard
import {
  Menu,
  Search,
  Clock,
  Hash,
} from "lucide-react"; 

interface HeaderProps {
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Header = ({ setIsMenuOpen }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // [OPTIMASI UTAMA]
  // 1. Hapus state lokal.
  // 2. Ambil data dari GlobalContext.
  // 3. Alias variable agar sesuai dengan kode JSX Anda (mobileTags, latestArticles)
  const { tags: mobileTags, recentArticles: latestArticles } = useGlobalData();

  const navigate = useNavigate();
  const location = useLocation();
  const { pageTitle } = useSidebar();
  
  // [LOGIKA SCROLL] Menambahkan fitur auto-hide saat scroll ke bawah
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Tampilkan jika di paling atas, atau jika scroll ke atas
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false); // Scroll ke bawah -> Sembunyi
      } else {
        setIsVisible(true);  // Scroll ke atas -> Muncul
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Handlers ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMobileSearchOpen(false);
    if (searchQuery.trim()) {
      navigate(`/articles?search=${searchQuery}`);
    }
  };

  const handleTagClick = (slug: string, name: string) => {
    setIsMobileSearchOpen(false);
    navigate(`/articles?tags__slug=${slug}&tag_name=${name}`);
  };

  // Helper: Title Formatter
  const getPageTitle = (pathname: string) => {
    if (pathname === "/") return "Dashboard"; 
    if (pathname.startsWith("/articles") && !pageTitle) return "Knowledge Base";
    if (pageTitle) return pageTitle;

    const segments = pathname.split("/").filter((s) => s);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment || lastSegment === "articles") return "Knowledge Base";

    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <>
      <header 
        className={`
          sticky top-0 z-30 w-full
          transition-transform duration-300 ease-in-out will-change-transform
          ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        `}
      >
        {/* Container Glassmorphism */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <nav className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            
            {/* LEFT: Menu & Title */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Tombol Menu Mobile */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Open Menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-3 overflow-hidden">
                 {/* Separator vertical hanya di desktop */}
                 <span className="hidden md:flex h-6 w-px bg-gray-300 dark:bg-gray-700"></span>
                 <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate tracking-tight">
                    {currentTitle}
                 </h1>
              </div>
            </div>

            {/* RIGHT: Search & Theme */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Search */}
              <form onSubmit={handleSearch} className="hidden md:block relative group">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-64 pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                        placeholder="Search documentation..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-xs text-gray-400 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">⌘K</span>
                    </div>
                </div>
              </form>

              {/* Mobile Search Trigger */}
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
              <ThemeToggle />
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 w-full transform translate-y-full">
             <ReadingProgressBar />
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-950 animate-in fade-in duration-200 flex flex-col md:hidden">
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-xl border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                        placeholder="Search articles, tags..."
                    />
                </form>
            </div>
            <button 
                onClick={() => setIsMobileSearchOpen(false)}
                className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
                <span className="sr-only">Close</span>
                <p className="text-sm font-medium">Cancel</p>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-8">
            {/* Trending Tags */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                    <Hash className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Trending Topics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {mobileTags.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => handleTagClick(tag.slug, tag.name)}
                            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            #{tag.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Updates */}
            <div>
                <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Recent Updates</h3>
                </div>
                <div className="space-y-3">
                    {latestArticles.map(article => (
                        <Link
                            key={article.id}
                            to={`/articles/${article.slug}`}
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                        >
                            <div className="w-1 h-12 bg-gray-200 dark:bg-gray-800 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1">
                                    {article.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {new Date(article.published_date).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;