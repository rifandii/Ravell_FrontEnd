// src/SidebarContext.tsx
/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Heading } from './types/types';;

interface SidebarContextType {
  headings: Heading[];
  setHeadings: (headings: Heading[]) => void;
  pageTitle: string;
  setPageTitle: (title: string) => void;

}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [pageTitle, setPageTitle] = useState('');

  return (
    <SidebarContext.Provider value={{ headings, setHeadings, pageTitle, setPageTitle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};