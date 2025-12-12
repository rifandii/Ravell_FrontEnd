// src/hooks/useActiveHeading.ts
import { useEffect, useState } from 'react';
import type { Heading } from '../types/types'; // Menggunakan tipe Heading yang sudah di src/types/types.ts

// Opsi untuk Intersection Observer
const observerOptions = {
  root: null, // Mengamati di viewport
  rootMargin: '0px 0px -50% 0px', // Menargetkan heading saat melewati titik tengah viewport
  threshold: [0, 1], // Mengamati saat heading masuk dan keluar
};

export const useActiveHeading = (headings: Heading[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      // Filter entri yang sedang berpotongan (intersecting)
      const visibleHeadings = entries.filter((entry) => entry.isIntersecting);

      if (visibleHeadings.length > 0) {
        // Cari heading yang paling dekat dengan bagian atas viewport
        const topVisibleEntry = visibleHeadings.reduce((prev, current) => {
          return (prev.boundingClientRect.top < current.boundingClientRect.top) ? prev : current;
        });

        // Set ID yang aktif ke ID elemen yang paling atas terlihat
        setActiveId(topVisibleEntry.target.id);
      } else if (window.scrollY === 0 && headings.length > 0) {
        // Jika di bagian paling atas halaman, aktifkan heading pertama
        setActiveId(headings[0].id);
      }
    }, observerOptions);

    // Amati setiap elemen heading yang sudah ada di DOM
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    // Bersihkan observer saat komponen di-unmount
    return () => {
      observer.disconnect();
    };
  }, [headings]); 

  return activeId;
};