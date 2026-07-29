# Frontend Cache Policy

Last reviewed: 2026-07-13

This policy applies to the sole active frontend runtime: Next.js App Router.

## Runtime Goals

- Keep prerendered Next.js HTML and article data governed by Next.js ISR.
- Prevent an obsolete SPA shell from being served for App Router routes.
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

Requests under `/api/` and requests to the canonical `api.ravell.tech` host
pass through without `respondWith`. Client-side API calls use the shared Axios
client. Server-side App Router calls use native `fetch` with explicit Next.js
revalidation metadata where needed.

## Static Assets

The service worker uses cache-first only for same-origin fingerprinted assets:

- `/_next/static/`

This path is safe because Next.js emits content-addressed build assets there.
The retired Vite `/assets/` path is not cached by the service worker.
Non-fingerprinted files such as `/manifest.json`, `/logo.png`, and PWA icons
are not precached by the service worker.

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
the legacy cache names and older caches in the `ravell-static-*` namespace only.
Other product caches, such as a future `ravell-other-feature-v1`, are not owned
by this worker and must not be deleted by this migration. The worker claims
clients after activation but does not force-refresh open tabs.

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

There is no second service-worker registration path in the active source tree.

## Regression Coverage

`tests/e2e/service-worker.spec.ts` covers:

- fresh visit service-worker registration;
- legacy `ravell-*-v1` cache cleanup;
- preservation of non-worker caches such as `ravell-other-feature-v1`;
- cache-first behavior only for `/_next/static/`, not `/assets/`;
- update from a simulated legacy worker to the current worker;
- assertion that activation does not force a tab reload;
- assertion that offline article navigation fails instead of receiving an SPA shell.
