// src/components/TableOfContents.tsx
import type { Heading } from '../types/types';
import { useActiveHeading } from '../hooks/useActiveHeading'; 

interface TableOfContentsProps {
  headings: Heading[];
}

const TableOfContents = ({ headings }: TableOfContentsProps) => {
  // [MODIFIKASI] Filter headings di sini untuk hanya menampilkan h2, h3, h4
  // Ini bertindak sebagai 'guard' agar TOC selalu bersih
  const displayHeadings = headings.filter(heading => 
    ['h2', 'h3', 'h4'].includes(heading.level)
  );

  // Gunakan list yang sudah difilter untuk hook active heading
  const activeId = useActiveHeading(displayHeadings);

  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  if (displayHeadings.length === 0) {
    return null;
  }

  return (
    <nav className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-h-[85vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Table of Contents
      </h3>
      <ul className="space-y-2 text-sm">
        {displayHeadings.map((heading) => {
          const levelNumber = Number(heading.level.replace('h', ''));
          const paddingLeft = (levelNumber - 2) * 12;
          
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
                  w-full text-left transition-colors duration-200 py-1 break-words
                  text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300
                  ${isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold border-l-4 border-blue-600 dark:border-blue-400 pl-2 -ml-3' // -ml-3 untuk kompensasi border agar teks tetap rata
                    : 'pl-1' 
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