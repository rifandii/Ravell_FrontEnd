// src/components/TableOfContents.tsx

import type { Heading } from '../types/types';
import { useActiveHeading } from '../hooks/useActiveHeading'; // Import hook baru

interface TableOfContentsProps {
  headings: Heading[];
}

const TableOfContents = ({ headings }: TableOfContentsProps) => {
  // Panggil hook untuk mendapatkan ID heading yang sedang aktif
  const activeId = useActiveHeading(headings);

  // Logic untuk smooth scroll (diperbaiki agar link di TOC bekerja)
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Offset 80px agar heading tidak tertutup oleh sticky header
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[85vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Table of Contents
      </h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => {
          // Menghitung indentasi berdasarkan level heading (h2: 0, h3: 4)
          const paddingLeft = (Number(heading.level.replace('h', '')) - 2) * 4;
          const isActive = activeId === heading.id;

          return (
            <li 
              key={heading.id} 
              style={{ paddingLeft: `${paddingLeft}px` }}
              className="transition-all duration-200"
            >
              <button
                onClick={() => handleScrollTo(heading.id)}
                className={`
                  w-full text-left transition-colors duration-200 py-1
                  text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300
                  // Styling untuk item aktif: border kiri dan warna biru
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-400 pl-2 -ml-2' 
                    : 'pl-3' 
                  }
                `}
              >
                {heading.text}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TableOfContents;