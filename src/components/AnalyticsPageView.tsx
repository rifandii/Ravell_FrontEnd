'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => {
    window.dataLayer?.push(args);
  });

  return window.gtag;
}

export default function AnalyticsPageView({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  const pagePath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!measurementId || lastTrackedPath.current === pagePath) return;

    // Give App Router metadata/title updates a short window to settle.
    const handle = window.setTimeout(() => {
      const gtag = ensureGtag();
      lastTrackedPath.current = pagePath;

      gtag('event', 'page_view', {
        send_to: measurementId,
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
    }, 100);

    return () => window.clearTimeout(handle);
  }, [measurementId, pagePath]);

  return null;
}
