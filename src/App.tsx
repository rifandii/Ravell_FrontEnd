// src/App.tsx
import { useState, useEffect, lazy, Suspense } from "react"; // [BARU] Import lazy & Suspense
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SidebarProvider } from "./SidebarContext";
import { ThemeProvider } from "./ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import
import { SpeedInsights } from '@vercel/speed-insights/next';

// Components (Eager Load - Dimuat langsung karena selalu tampil)
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar";

// [OPTIMASI] Pages (Lazy Load - Dimuat hanya saat dibutuhkan)
const HomePage = lazy(() => import("./pages/HomePage"));
const ArticleListPage = lazy(() => import("./pages/ArticleListPage"));
const ArticleDetailPage = lazy(() => import("./pages/ArticleDetailPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const TagsPage = lazy(() => import("./pages/TagsPage"));
const ArchivesPage = lazy(() => import("./pages/ArchivesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const queryClient = new QueryClient();

// [BARU] Komponen Loading Sederhana saat transisi halaman
const PageLoader = () => (
  <div className="flex items-center justify-center h-[50vh]">
    <div className="relative w-12 h-12">
      <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
      <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>
);

// --- Utility: ScrollToTop ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <SidebarProvider>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30">
              <div className="flex justify-center mx-auto">
                {/* Sidebar statis (kiri) */}
                <div className="shrink-0">
                  <Sidebar
                    isMenuOpen={isMenuOpen}
                    setIsMenuOpen={setIsMenuOpen}
                  />
                </div>

                {/* Area Konten Tengah */}
                <div className="flex-1 min-w-0 flex flex-col relative mx-4">
                  <Header setIsMenuOpen={setIsMenuOpen} />

                  <main className="flex-grow w-full">
                    {/* [OPTIMASI] Suspense membungkus Routes untuk menangani loading state */}
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/articles" element={<ArticleListPage />} />
                        <Route
                          path="/articles/:slug"
                          element={<ArticleDetailPage />}
                        />
                        <Route
                          path="/categories"
                          element={<CategoriesPage />}
                        />
                        <Route path="/tags" element={<TagsPage />} />
                        <Route path="/archives" element={<ArchivesPage />} />
                        <Route path="/about" element={<AboutPage />} />
                      </Routes>
                    </Suspense>
                    <SpeedInsights />
                  </main>
                </div>

                {/* Sidebar statis (kanan) */}
                <RightSidebar />
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
