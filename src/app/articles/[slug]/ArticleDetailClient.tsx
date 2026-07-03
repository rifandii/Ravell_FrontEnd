'use client';

import { useEffect, useState } from 'react';
import { useSidebar } from '../../../SidebarContext';
import ImageModal from '../../../components/ImageModal';
import slugify from 'slugify';
import type { Article, Heading } from '../../../types/types';

// Client companion for the SSG article page. It only handles browser-only
// behavior: sidebar state, heading extraction, and image zoom interactions.
export default function ArticleDetailClient({ article }: { article: Article }) {
  const { setHeadings, setPageTitle } = useSidebar();
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setPageTitle(article.title);

    // Markdown is rendered by the server component first; extract H2/H3 anchors
    // after hydration so the right sidebar can build an accurate table of contents.
    const extractHeadings = () => {
      const articleEl = document.querySelector('article');
      if (!articleEl) return;

      const hTags = articleEl.querySelectorAll('h2, h3');
      const newHeadings: Heading[] = [];

      hTags.forEach((h) => {
        const text = h.textContent || '';
        const id = h.id || slugify(text, { lower: true, strict: true });
        h.id = id;
        newHeadings.push({
          id,
          text,
          level: h.tagName.toLowerCase(),
        });
      });
      setHeadings(newHeadings);
    };

    const timer = setTimeout(extractHeadings, 150);

    return () => {
      setHeadings([]);
      setPageTitle('');
      clearTimeout(timer);
    };
  }, [article, setHeadings, setPageTitle]);

  // Event delegation keeps markdown image zoom working without attaching a
  // separate click handler to each generated image node.
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
        imageAlt={article.title}
        onClose={() => setZoomedImageUrl(null)}
      />
    </>
  );
}
