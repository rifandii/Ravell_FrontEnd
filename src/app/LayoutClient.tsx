'use client';

import { useState } from 'react';
import SidebarNext from '../components/next/SidebarNext';
import HeaderNext from '../components/next/HeaderNext';
import RightSidebarNext from '../components/next/RightSidebarNext';
import ScrollToTopButton from '../components/ScrollToTopButton';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-purple-500/30">
      <div className="flex w-full px-0">
        {/* Sidebar statis (kiri) */}
        <SidebarNext isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        {/* Area Konten Tengah */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          <HeaderNext setIsMenuOpen={setIsMenuOpen} />

          <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
        </div>

        {/* Sidebar statis (kanan) */}
        <RightSidebarNext />
      </div>
      <ScrollToTopButton />
    </div>
  );
}
