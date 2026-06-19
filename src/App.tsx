// src/App.tsx
import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SidebarProvider } from "./SidebarContext";
import { ThemeProvider } from "./ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { usePageTracking } from "./hooks/usePageTracking";

// Components
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";
import PageTransition from "./components/PageTransition";
import ScrollToTopButton from "./components/ScrollToTopButton";

// Pages (Lazy Load)
const HomePage = lazy(() => import("./pages/HomePage"));
const ArticleListPage = lazy(() => import("./pages/ArticleListPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const TagsPage = lazy(() => import("./pages/TagsPage"));
const ArchivesPage = lazy(() => import("./pages/ArchivesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="relative w-12 h-12">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PageTracker = () => {
  usePageTracking();
  return null;
};

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30">
      <div className="flex w-full px-0">
        {/* Sidebar statis (kiri) */}
        <Sidebar
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />

        {/* Area Konten Tengah */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          <Header setIsMenuOpen={setIsMenuOpen} />

          <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">
            {/* Suspense membungkus AnimatePresence & Routes untuk menangani loading state */}
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                  <Route path="/articles" element={<PageTransition><ArticleListPage /></PageTransition>} />
                  <Route
                    path="/articles/:slug"
                    element={<PageTransition><ArticleDetailPage /></PageTransition>}
                  />
                  <Route
                    path="/categories"
                    element={<PageTransition><CategoriesPage /></PageTransition>}
                  />
                  <Route path="/tags" element={<PageTransition><TagsPage /></PageTransition>} />
                  <Route path="/archives" element={<PageTransition><ArchivesPage /></PageTransition>} />
                  <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
                </Routes>
              </AnimatePresence>
            </Suspense>
            <SpeedInsights />
          </main>
        </div>

        {/* Sidebar statis (kanan) */}
        <RightSidebar />
      </div>
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <SidebarProvider>
            <ScrollToTop />
            <PageTracker />
            <AppContent />
          </SidebarProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
