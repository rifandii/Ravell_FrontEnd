# Frontend Cache Policy

Last reviewed: 2026-06-28

This policy applies to the active Next.js App Router runtime. The legacy Vite
SPA remains in the repository only for fallback and comparison commands.

## Runtime Goals

- Keep prerendered Next.js HTML and article data governed by Next.js ISR.
- Prevent the legacy SPA shell from being served for App Router routes.
- Preserve safe client-side caching only for fingerprinted static assets.
- Let backend API freshness be controlled by the API response and Next.js data
  fetching layer, not by the browser service worker.

## Offline Navigation

Offline document navigation is not supported.

The service worker does not intercept `request.mode === "navigate"` or document
requests. If the network is unavailable, the browser should fail normally
instead of serving a stale `/index.html` shell. This is intentional because
article pages are SSG/ISR documents and must not be substituted with a generic
SPA fallback.

## Documents and Article Routes

Document requests, including `/`, `/articles`, and `/articles/[slug]`, are left
to the browser, Vercel CDN, and Next.js. The service worker does not cache them,
does not use network-first document fallback logic, and never returns
`/index.html` for article routes.

Article publish, edit, and unpublish freshness is therefore no worse than the
approved Next.js ISR policy. Current article detail pages revalidate hourly via
`next: { revalidate: 3600 }`.

## API Requests

The service worker does not cache API requests.

Requests under `/api/` and requests to `api.ravell.tech` or
`api-dev.ravell.tech` pass through without `respondWith`. Client-side API calls
use the shared Axios client. Server-side App Router calls use native `fetch`
with explicit Next.js revalidation metadata where needed.

## Static Assets

The service worker uses cache-first only for same-origin fingerprinted assets:

- `/_next/static/`
- `/assets/` for legacy Vite comparison builds

These paths are safe because deployed file names are content-addressed or
versioned by the build output. Non-fingerprinted files such as `/manifest.json`,
`/logo.png`, and PWA icons are not precached by the service worker.

## Images

Images are not cached by the service worker. This avoids serving stale article
media after backend content changes. Browser, CDN, and backend response headers
remain responsible for image caching.

## Migration From Legacy Caches

The previous SPA-era service worker used these cache names:

- `ravell-cache-v1`
- `ravell-assets-v1`
- `ravell-images-v1`

The current service worker uses `ravell-static-v2`. During activation it deletes
the legacy cache names and any other `ravell-*` cache that is not the current
static cache. If legacy caches are found, the worker claims clients and reloads
open window clients once so old tabs can leave the stale SPA shell without a
manual browser-cache uninstall.

The service worker file is served with:

```text
Cache-Control: no-cache, no-store, must-revalidate
```

This header is configured in `vercel.json` so browsers can discover the updated
worker script promptly.

## Service Worker Registration

The active Next.js runtime registers `/sw.js` from
`src/components/ServiceWorkerRegistration.tsx` only in production builds. This
keeps `next dev` from accumulating local service-worker state while still
updating users on Vercel production and development deployments.

The legacy Vite entry point keeps its existing production-only registration for
fallback comparison builds.

## Regression Coverage

`tests/e2e/service-worker.spec.ts` covers:

- fresh visit service-worker registration;
- legacy `ravell-*-v1` cache cleanup;
- update from a simulated legacy worker to the current worker;
- reload and navigation to an article route;
- assertion that an article route is not served a legacy SPA shell.
