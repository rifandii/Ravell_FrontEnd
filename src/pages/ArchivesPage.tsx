// src/pages/ArchivesPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import { 
  Calendar, 
  History, 
  ChevronRight, 
  Archive, 
  FileText 
} from 'lucide-react';
import SEO from '../components/SEO';

// Types
interface MonthArchive {
  month: string;
  month_number: number;
  post_count: number;
}

interface YearArchive {
  year: number;
  total_posts: number;
  months: MonthArchive[];
}

const ArchivesPage = () => {
  const [archives, setArchives] = useState<YearArchive[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.ravell.tech';
        const response = await axios.get(`${apiBaseUrl}/api/archives/`);
        setArchives(response.data);
      } catch (err) {
        console.error('Error fetching archives:', err);
        setError('Unable to load timeline data.');
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, []);

  if (loading) {
    return (
      <div className="w-full px-4 md:px-8 py-12 animate-in fade-in duration-500">
        {/* Header Skeleton — mirrors actual header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="flex justify-center mb-6">
            <Skeleton width={64} height={64} borderRadius={16} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
          </div>
          <Skeleton width={220} height={36} className="mx-auto mb-3" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
          <Skeleton width={380} height={20} className="mx-auto" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
        </div>

        {/* Timeline content skeleton */}
        <div className="max-w-3xl mx-auto relative">
          {/* Main Spine Line */}
          <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800"></div>

          <div className="space-y-12">
            {[1, 2].map((i) => (
              <div key={i} className="relative">
                {/* Year Marker Skeleton */}
                <div className="relative flex items-center mb-6">
                  <div className="absolute left-[11px] w-3 h-3 bg-purple-600/30 rounded-full ring-4 ring-white dark:ring-gray-950 z-10"></div>
                  <div className="ml-12 flex items-center gap-3">
                    <Skeleton width={70} height={28} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                    <Skeleton width={65} height={20} borderRadius={12} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                  </div>
                </div>

                {/* Months Skeleton List */}
                <div className="space-y-4 ml-12">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="relative flex items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-150 dark:border-gray-800"
                    >
                      {/* Horizontal Connector Line */}
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-gray-100 dark:bg-gray-800"></div>
                      <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

                      {/* Icon box placeholder */}
                      <Skeleton width={40} height={40} borderRadius={8} baseColor="#d3d3d3" highlightColor="#e9e9e9" />

                      {/* Text details */}
                      <div className="ml-4 flex-grow">
                        <Skeleton width="120px" height={18} className="mb-2" baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                        <Skeleton width="80px" height={14} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                      </div>

                      {/* Chevron placeholder */}
                      <Skeleton width={16} height={16} baseColor="#d3d3d3" highlightColor="#e9e9e9" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <History className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Failed to Load Timeline</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 py-12 animate-in fade-in duration-500">
      <SEO 
        title="Archives" 
        description="A chronological history of all published articles and updates."
      />
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-2xl mx-auto text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 mb-6 shadow-sm">
          <Archive className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          Archive Timeline
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          A chronological history of all published articles and updates.
        </p>
      </div>

      {/* --- TIMELINE CONTENT --- */}
      <div className="max-w-3xl mx-auto">
        {archives.length > 0 ? (
          <div className="relative">
            
            {/* Main Vertical Line (Spine) */}
            <div className="absolute left-4 top-4 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

            <div className="space-y-12">
              {archives.map((yearData) => (
                <div key={yearData.year} className="relative">
                  
                  {/* YEAR MARKER (Sticky logic looks good conceptually, but simple relative is safer here) */}
                  <div className="relative flex items-center mb-6">
                    {/* Dot on Spine */}
                    <div className="absolute left-[11px] w-3 h-3 bg-purple-600 rounded-full ring-4 ring-white dark:ring-gray-950 z-10"></div>
                    
                    {/* Year Badge */}
                    <div className="ml-12 flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {yearData.year}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        {yearData.total_posts} Posts
                      </span>
                    </div>
                  </div>

                  {/* MONTHS LIST */}
                  <div className="space-y-4 ml-12">
                    {yearData.months.map((monthData) => (
                      <Link
                        key={monthData.month}
                        to={`/articles?year=${yearData.year}&month=${monthData.month_number}`}
                        className="group relative flex items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all duration-300"
                      >
                        {/* Horizontal Connector Line */}
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-gray-200 dark:bg-gray-800 group-hover:bg-purple-300 dark:group-hover:bg-purple-700 transition-colors"></div>
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full group-hover:bg-purple-500 transition-colors"></div>

                        {/* Icon Box */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 transition-colors">
                           <Calendar className="w-5 h-5" />
                        </div>

                        {/* Text Content */}
                        <div className="ml-4 flex-grow">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {monthData.month}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            <FileText className="w-3 h-3" />
                            {monthData.post_count} Articles
                          </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                  
                </div>
              ))}
            </div>

            {/* Bottom Terminator */}
            <div className="absolute left-[9px] bottom-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-950 flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No archives found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivesPage;