import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from './cachePolicy';

type SyndicationKind = 'sitemap' | 'rss' | 'atom';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ravell.tech').replace(/\/+$/, '');

const SYNDICATION_TARGETS: Record<SyndicationKind, { path: string; tag: string }> = {
  sitemap: { path: '/sitemap.xml', tag: CACHE_TAGS.SITEMAP },
  rss: { path: '/feed/rss/', tag: CACHE_TAGS.FEED },
  atom: { path: '/feed/atom/', tag: CACHE_TAGS.FEED },
};

export async function publicSyndicationResponse(kind: SyndicationKind) {
  const target = SYNDICATION_TARGETS[kind];

  try {
    const response = await fetch(`${API_BASE_URL}${target.path}`, {
      headers: { Accept: 'application/xml, application/rss+xml, application/atom+xml;q=0.9, text/xml;q=0.8' },
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: [CACHE_TAGS.CONTENT, target.tag],
      },
    });

    if (!response.ok) {
      return new Response('Public syndication source unavailable.', {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    return new Response(await response.text(), {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': response.headers.get('content-type') || 'application/xml; charset=utf-8',
      },
    });
  } catch {
    return new Response('Public syndication source unavailable.', {
      status: 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
