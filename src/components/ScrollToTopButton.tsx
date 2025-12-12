// src/components/ScrollToTopButton.tsx
import { useState, useEffect } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Tampilkan tombol saat user scroll ke bawah
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Gerakkan halaman ke atas dengan smooth scroll
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      aria-label="Scroll to top"
    >
      <ChevronUpIcon className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTopButton;