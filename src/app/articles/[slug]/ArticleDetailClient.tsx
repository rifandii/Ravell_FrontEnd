'use client';

import { useEffect, useState } from 'react';
import { useSidebar } from '../../../SidebarContext';
import ImageModal from '../../../components/ImageModal';
import slugify from 'slugify';
import type { Article, Heading } from '../../../types/types';

export default function ArticleDetailClient({ article }: { article: Article }) {
  const { setHeadings, setPageTitle } = useSidebar();
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // 1. Set judul halaman di sidebar global
    setPageTitle(article.title);

    // 2. Ekstrak Heading H2 & H3 dari konten Markdown secara dinamis untuk TOC
    const extractHeadings = () => {
      const articleEl = document.querySelector('article');
      if (!articleEl) return;

      const hTags = articleEl.querySelectorAll('h2, h3');
      const newHeadings: Heading[] = [];

      hTags.forEach((h) => {
        const text = h.textContent || '';
        const id = h.id || slugify(text, { lower: true, strict: true });
        h.id = id; // Tambahkan anchor ID
        newHeadings.push({
          id,
          text,
          level: h.tagName.toLowerCase(),
        });
      });
      setHeadings(newHeadings);
    };

    // Eksekusi ekstraksi heading setelah render markdown selesai
    const timer = setTimeout(extractHeadings, 150);

    return () => {
      setHeadings([]);
      setPageTitle('');
      clearTimeout(timer);
    };
  }, [article, setHeadings, setPageTitle]);

  // Listener untuk zoom gambar di dalam artikel
  useEffect(() => {
    const handleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLImageElement;
      if (target.tagName === 'IMG' && target.closest('article')) {
        setZoomedImageUrl(target.src);
      }
    };

    const articleEl = document.querySelector('article');
    if (articleEl) {
      articleEl.addEventListener('click', handleImageClick);
    }

    return () => {
      if (articleEl) {
        articleEl.removeEventListener('click', handleImageClick);
      }
    };
  }, []);

  return (
    <>
      <ImageModal
        imageUrl={zoomedImageUrl}
        onClose={() => setZoomedImageUrl(null)}
      />
    </>
  );
}
