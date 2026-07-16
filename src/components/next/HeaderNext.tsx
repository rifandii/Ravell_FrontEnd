'use client';

import { useState, useEffect, useRef, type RefObject } from "react";
import dayjs from "dayjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "../ThemeToggle";
import ReadingProgressBar from "../ReadingProgressBar";
import { useSidebar } from "../../SidebarContext";
import { useGlobalData } from "../../context/GlobalContext";
import {
  Menu,
  Search,
  Clock,
  Hash,
} from "lucide-react";

interface HeaderProps {
  isMenuOpen: boolean;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenMenu: () => void;
}

const HeaderNext = ({ isMenuOpen, menuButtonRef, onOpenMenu }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("desktop-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isMobileSearchOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => mobileSearchInputRef.current?.focus(), 0);

    const handleOverlayKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileSearchOpen(false);
        mobileSearchButtonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleOverlayKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener('keydown', handleOverlayKeyDown);
    };
  }, [isMobileSearchOpen]);

  const { tags: mobileTags, recentArticles: latestArticles } = useGlobalData();
  const router = useRouter();
  const pathname = usePathname();
  const { pageTitle } = useSidebar();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMobileSearchOpen(false);
    if (searchQuery.trim()) {
      router.push(`/articles?search=${searchQuery}`);
    }
  };

  const handleTagClick = (slug: string, name: string) => {
    setIsMobileSearchOpen(false);
    router.push(`/articles?tags__slug=${slug}&tag_name=${name}`);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    mobileSearchButtonRef.current?.focus();
  };

  const getPageTitle = (path: string) => {
    if (path === "/") return "Dashboard";
    if (path.startsWith("/articles") && !pageTitle) return "Knowledge Base";
    if (pageTitle) return pageTitle;

    const segments = path.split("/").filter((s) => s);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment || lastSegment === "articles") return "Knowledge Base";

    return lastSegment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const currentTitle = getPageTitle(pathname);

  return (
    <>
      <header className="sticky top-0 z-30 w-full">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
          <nav className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={onOpenMenu}
                className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
                aria-controls="primary-navigation"
              >
                <Menu className="h-6 w-6" aria-hidden="true" focusable="false" />
              </button>

              <div className="flex items-center gap-3 overflow-hidden">
                 <span className="hidden md:flex h-6 w-px bg-gray-300 dark:bg-gray-700"></span>
                 <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate tracking-tight">
                    {currentTitle}
                 </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <motion.form
                onSubmit={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setIsSearchFocused(false);
                  }
                }}
                className="relative hidden md:block group"
                initial={false}
                animate={isSearchFocused ? { y: -1, scale: 1.015 } : { y: 0, scale: 1 }}
                whileHover={{ y: -1 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              >
                <motion.div
                  className="relative"
                  initial={false}
                  animate={isSearchFocused ? { boxShadow: "0 14px 34px rgba(147, 51, 234, 0.18)" } : { boxShadow: "0 0 0 rgba(0, 0, 0, 0)" }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 group-focus-within:scale-110 group-focus-within:rotate-3 transition-all duration-300 ease-in-out" />
                    </div>
                    <input
                        id="desktop-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-64 focus:w-80 lg:focus:w-96 pl-10 pr-12 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-purple-500/50 focus:bg-white dark:focus:bg-gray-900 focus:ring-4 focus:ring-purple-500/10 rounded-xl text-sm transition-all duration-300 ease-in-out text-gray-900 dark:text-white placeholder-gray-500 outline-none shadow-sm focus:shadow-md"
                        placeholder="Search documentation..."
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-[10px] text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 shadow-sm group-focus-within:opacity-0 group-focus-within:scale-90 transition-all duration-300 ease-in-out font-mono">⌘K</span>
                    </div>
                </motion.div>
              </motion.form>

              <motion.button
                onClick={() => setIsMobileSearchOpen(true)}
                ref={mobileSearchButtonRef}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                aria-label="Open search"
                whileHover={{ y: -1, scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              >
                <Search className="h-5 w-5" />
              </motion.button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
              <ThemeToggle />
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 w-full transform translate-y-full">
             <ReadingProgressBar />
          </div>
        </div>
      </header>

      {isMobileSearchOpen && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-white animate-in fade-in duration-200 dark:bg-gray-950 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Search articles"
        >
            <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                <form onSubmit={handleSearch}>
                    <label htmlFor="mobile-search-input" className="sr-only">
                      Search articles and tags
                    </label>
                    <input
                        id="mobile-search-input"
                        ref={mobileSearchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-xl border-none text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                        placeholder="Search articles, tags..."
                    />
                </form>
            </div>
            <button
                onClick={closeMobileSearch}
                className="p-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
                <span className="sr-only">Close</span>
                <p className="text-sm font-medium">Cancel</p>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-8">
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
                            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                            #{tag.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-4 text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Recent Updates</h3>
                </div>
                <div className="space-y-3">
                    {latestArticles.map(article => (
                        <Link
                            key={article.id}
                            href={`/articles/${article.slug}`}
                            onClick={() => setIsMobileSearchOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
                        >
                            <div className="w-1 h-12 bg-gray-200 dark:bg-gray-800 rounded-full group-hover:bg-purple-500 transition-colors"></div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1">
                                    {article.title}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {dayjs(article.published_date).format('MMM D, YYYY')}
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

export default HeaderNext;
