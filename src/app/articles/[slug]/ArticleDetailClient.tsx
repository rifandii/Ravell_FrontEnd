'use client';

import { useEffect, useState } from 'react';
import { useSidebar } from '../../../SidebarContext';
import ImageModal from '../../../components/ImageModal';
import slugify from 'slugify';
import type { Heading } from '../../../types/types';

// Client companion for the SSG article page. It only handles browser-only
// behavior: sidebar state, heading extraction, and image zoom interactions.
export default function ArticleDetailClient({ title }: { title: string }) {
  const { setHeadings, setPageTitle } = useSidebar();
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [zoomedImageAlt, setZoomedImageAlt] = useState(title);

  useEffect(() => {
    setPageTitle(title);

    // Markdown is rendered by the server component first; extract H2/H3 anchors
    // after hydration so the right sidebar can build an accurate table of contents.
    const extractHeadings = () => {
      const articleEl = document.querySelector('article');
      if (!articleEl) return;

      const hTags = articleEl.querySelectorAll('h2, h3');
      const newHeadings: Heading[] = [];

      hTags.forEach((h) => {
        const headingClone = h.cloneNode(true) as HTMLElement;
        headingClone.querySelectorAll('a[href^="#"]').forEach((anchor) => anchor.remove());
        const text = headingClone.textContent?.trim() || '';
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
  }, [setHeadings, setPageTitle, title]);

  // Event delegation keeps markdown image zoom working without attaching a
  // separate click handler to each generated image node.
  useEffect(() => {
    const openArticleImage = (image: HTMLImageElement) => {
      setZoomedImageAlt(image.alt || title);
      setZoomedImageUrl(image.currentSrc || image.src);
    };

    const handleImageClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const image = target.closest('img');
      if (image && (image.closest('article') || image.dataset.articleImage === 'true')) {
        openArticleImage(image);
      }
    };

    const handleImageKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const image = target.closest('img');
      if (image && (image.closest('article') || image.dataset.articleImage === 'true') && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        openArticleImage(image);
      }
    };

    const articleEl = document.querySelector('article');
    const previewImages = document.querySelectorAll<HTMLImageElement>('article img, img[data-article-image="true"]');
    previewImages.forEach((image) => {
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `Open image preview${image.alt ? `: ${image.alt}` : ''}`);
      image.classList.add('cursor-zoom-in');
    });

    document.addEventListener('click', handleImageClick);
    document.addEventListener('keydown', handleImageKeyDown);

    if (articleEl) {
      articleEl.querySelectorAll('img').forEach((image) => image.classList.add('cursor-zoom-in'));
    }

    return () => {
      document.removeEventListener('click', handleImageClick);
      document.removeEventListener('keydown', handleImageKeyDown);
    };
  }, [title]);

  return (
    <>
      <ImageModal
        imageUrl={zoomedImageUrl}
        imageAlt={zoomedImageAlt}
        onClose={() => setZoomedImageUrl(null)}
      />
    </>
  );
}
