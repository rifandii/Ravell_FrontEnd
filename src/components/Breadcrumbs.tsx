// src/components/Breadcrumbs.tsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';


// Tambahkan prop articleTitle
interface BreadcrumbsProps {
  articleTitle?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ articleTitle }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Fungsi untuk mengubah slug menjadi teks yang mudah dibaca
  const formatName = (name: string): string => {
    // Menangani slug filter (misal: categories__slug=security)
    if (name.includes('=')) {
        const parts = name.split('=');
        if (location.search.includes('category_name')) {
            const nameParam = new URLSearchParams(location.search).get('category_name');
            if (nameParam) return nameParam.replace(/%20/g, ' ');
        }
        return parts[1] ? parts[1].replace(/%20/g, ' ') : name;
    }
    return name.split('-')
               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
               .join(' ');
  };

  return (
    <nav className="text-sm" aria-label="Breadcrumb">
      {/* [PERBAIKAN 1] 
        Hapus 'inline-flex' dan 'space-x' dari <ol>.
        Ini mengizinkan <ol> menjadi 'block' (default) 
        dan membiarkan konten di dalamnya mengalir (wrap) secara alami.
      */}
      <ol>
        {/* Item Home */}
        <li className="inline-flex items-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>

        {/* Item Breadcrumbs lainnya */}
        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const name = formatName(value);

          return (
            // [PERBAIKAN 2] 
            // Ubah <li> menjadi 'inline' (bukan 'inline-flex') 
            // agar mengalir seperti teks.
            <li key={to} className="inline">
              
              {/* [PERBAIKAN 3] Beri 'inline-block' agar sejajar */}
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1 inline-block" />
              
              {isLast ? (
                // [PERBAIKAN 4]
                // - Hapus 'truncate' dan 'max-w-xs'
                // - Tambahkan 'break-words' untuk mematahkan teks jika perlu
                <span className="text-gray-500 dark:text-gray-300 font-semibold cursor-default break-words">
                  {articleTitle || name} 
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;