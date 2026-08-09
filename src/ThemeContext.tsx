"use client";

// src/ThemeContext.tsx
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Stable SSR initial state: resolve the real theme after mount to avoid
  // hydration mismatches between the server-rendered HTML and the client.
  const [theme, setTheme] = useState<Theme>('light');
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    // Prefer explicit user choice, then fall back to the OS color scheme.
    const savedTheme = localStorage.getItem('theme');
    const resolvedTheme: Theme = savedTheme
      ? (savedTheme as Theme)
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    setTheme(resolvedTheme);
    setResolved(true);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    // Only sync the html class and persist after the stored/system theme has
    // been resolved; this prevents overwriting a saved preference on mount.
    if (!resolved) return;
    // Tailwind dark mode is class-based, so keep the html class in sync with context state.
    const root = window.document.documentElement;
    if (root && root.classList) {
      root.classList.remove(theme === 'light' ? 'dark' : 'light');
      root.classList.add(theme);
    }
    // Persist the explicit choice for the next visit.
    localStorage.setItem('theme', theme);
  }, [theme, resolved]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};