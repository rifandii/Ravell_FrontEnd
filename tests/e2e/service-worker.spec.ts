import { expect, test, type BrowserContext, type Page } from '@playwright/test';

const ARTICLE_PATH = process.env.E2E_ARTICLE_PATH || '/articles/deploying-ipsec-site-to-site-vpns-with-ftd';
const LEGACY_CACHE_NAMES = ['ravell-cache-v1', 'ravell-assets-v1', 'ravell-images-v1'];
const LEGACY_SPA_HTML = '<!doctype html><html><body><div id="root" data-testid="legacy-spa-shell">Legacy SPA shell</div><script type="module" src="/src/main.tsx"></script></body></html>';

test('registers the current service worker on a fresh production visit', async ({ page }) => {
  await page.goto('/');

  const scriptURL = await waitForActiveServiceWorker(page);
  expect(scriptURL).toContain('/sw.js');

  const cacheNames = await getCacheNames(page);
  for (const cacheName of LEGACY_CACHE_NAMES) {
    expect(cacheNames).not.toContain(cacheName);
  }
});

test('cleans legacy SPA caches and does not serve article routes from index.html', async ({ context, page }) => {
  await installLegacyWorkerRoute(context);
  await page.goto('/');

  await waitForActiveServiceWorker(page);

  let cacheNames = await getCacheNames(page);
  expect(cacheNames).toEqual(expect.arrayContaining(LEGACY_CACHE_NAMES));

  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
  });

  await context.unrouteAll({ behavior: 'wait' });
  await expectCurrentWorkerSource(page);

  const migratedPage = await context.newPage();
  await migratedPage.goto('/');
  await waitForActiveServiceWorker(migratedPage);

  await migratedPage.waitForFunction(async (legacyNames) => {
    const names = await caches.keys();
    return !names.some((name) => legacyNames.includes(name));
  }, LEGACY_CACHE_NAMES);

  cacheNames = await getCacheNames(migratedPage);
  for (const cacheName of LEGACY_CACHE_NAMES) {
    expect(cacheNames).not.toContain(cacheName);
  }

  const response = await migratedPage.goto(ARTICLE_PATH, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);

  const html = await response!.text();
  expect(html).not.toContain('data-testid="legacy-spa-shell"');
  expect(html).not.toContain('src="/src/main.tsx"');

  await expect(migratedPage.locator('main article').first()).toBeVisible();
});

async function installLegacyWorkerRoute(context: BrowserContext) {
  await context.route('**/sw.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      headers: {
        'Cache-Control': 'no-store',
      },
      body: `
const CACHE_NAME = 'ravell-cache-v1';
const ASSET_CACHE_NAME = 'ravell-assets-v1';
const IMAGE_CACHE_NAME = 'ravell-images-v1';
const LEGACY_SPA_HTML = ${JSON.stringify(LEGACY_SPA_HTML)};

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(Promise.all([
    caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', new Response(LEGACY_SPA_HTML, { headers: { 'Content-Type': 'text/html' } }))),
    caches.open(ASSET_CACHE_NAME),
    caches.open(IMAGE_CACHE_NAME),
  ]));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && event.request.mode === 'navigate') {
    event.respondWith(caches.match('/index.html'));
  }
});
`,
    });
  });
}

async function waitForActiveServiceWorker(page: Page) {
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active?.scriptURL.endsWith('/sw.js'));
  });

  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.scriptURL || '';
  });
}

async function getCacheNames(page: Page) {
  return page.evaluate(async () => caches.keys());
}

async function expectCurrentWorkerSource(page: Page) {
  const workerSource = await page.evaluate(async () => {
    const response = await fetch('/sw.js', { cache: 'no-store' });
    return response.text();
  });

  expect(workerSource).toContain('ravell-static-v2');
  expect(workerSource).not.toContain('Legacy SPA shell');
}
