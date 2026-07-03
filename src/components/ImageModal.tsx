// src/components/ImageModal.tsx
import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Ganti XIcon dengan XMarkIcon dari Heroicons
import { motion, AnimatePresence } from 'framer-motion';

interface ImageModalProps {
  imageUrl: string | null;
  imageAlt?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, imageAlt = 'Zoomed image', onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Logic untuk menutup modal saat klik di luar gambar atau menekan ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab' && imageUrl) {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    if (imageUrl) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Nonaktifkan scroll body saat modal terbuka
      const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0);

      return () => {
        window.clearTimeout(focusTimer);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
      };
    } else {
      document.body.style.overflow = ''; // Aktifkan kembali scroll body
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [imageUrl, onClose]);

  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
          onClick={onClose} // Menutup modal saat klik di luar
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          
          {/* Tombol Tutup (X) - Posisi di LUAR GAMBAR, Selalu Kontras */}
          <motion.button 
            ref={closeButtonRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-[81] cursor-pointer rounded-full bg-gray-800 bg-opacity-75 p-2 text-white transition-colors duration-200 hover:bg-opacity-100 hover:text-red-500 md:right-8"
            aria-label="Close image preview"
          >
            <XMarkIcon className="h-7 w-7" />
          </motion.button>

          {/* Kontainer Gambar dengan Animasi Easing/Spring */}
          <motion.div 
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative max-w-full max-h-[95vh]"
            onClick={(e) => e.stopPropagation()} // Mencegah klik pada gambar menutup modal
          >
            <img 
              src={imageUrl} 
              alt={imageAlt}
              className="max-w-full max-h-[95vh] object-contain rounded-xl shadow-2xl border border-gray-800/40"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageModal;
