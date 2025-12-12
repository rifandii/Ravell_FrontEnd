// src/components/ImageModal.tsx
import React, { useRef, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Ganti XIcon dengan XMarkIcon dari Heroicons

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose }) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Logic untuk menutup modal saat klik di luar gambar atau menekan ESC
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (imageUrl) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Nonaktifkan scroll body saat modal terbuka
    } else {
      document.body.style.overflow = ''; // Aktifkan kembali scroll body
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    // Wadah Modal: fixed inset-0 dan opacity untuk transisi latar belakang
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose} // Menutup modal saat klik di luar
    >
      
      {/* Tombol Tutup (X) - Posisi di LUAR GAMBAR, Selalu Kontras */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 md:right-8 text-white hover:text-red-500 transition-colors duration-200 p-2 rounded-full 
                   bg-gray-800 bg-opacity-75 hover:bg-opacity-100 z-[51]" // Pastikan z-index lebih tinggi
        aria-label="Tutup zoom gambar"
      >
        <XMarkIcon className="h-7 w-7" /> {/* Ukuran ikon yang lebih baik */}
      </button>

      {/* Kontainer Gambar dengan Animasi (menggunakan CSS untuk memicu transisi) */}
      <div 
        ref={imageContainerRef} 
        // Menggunakan transisi scale/opacity untuk efek zoom
        className="relative max-w-full max-h-[95vh] transform scale-100 transition-transform duration-300 ease-out"
        // Mencegah klik pada gambar menutup modal
        onClick={(e) => e.stopPropagation()} 
      >
        <img 
          src={imageUrl} 
          alt="Zoomed" 
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImageModal;