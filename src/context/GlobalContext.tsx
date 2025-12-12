
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getPaginatedTags, getLatestArticles } from '../services/apiClient';
import type { Tag, Article } from '../types/types';

interface GlobalContextType {
  tags: Tag[];
  recentArticles: Article[];
  loading: boolean;
  error: string | null;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      setLoading(true);
      try {
        const [tagsData, articlesData] = await Promise.all([
          getPaginatedTags(),
          getLatestArticles()
        ]);

        setTags(tagsData.results.slice(0, 10));
        setRecentArticles(articlesData.slice(0, 5));
      } catch (err) {
        console.error('Error fetching global data:', err);
        setError('Failed to load navigation data');
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  return (
    <GlobalContext.Provider value={{ tags, recentArticles, loading, error }}>
      {children}
    </GlobalContext.Provider>
  );
};

// [PERBAIKAN 3]
// Jika ESLint masih protes soal "fast refresh", tambahkan baris disable ini.
// Hook kustom sering kali memicu false positive pada aturan ini jika diekspor bersama komponen.
// eslint-disable-next-line react-refresh/only-export-components
export const useGlobalData = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalProvider');
  }
  return context;
};