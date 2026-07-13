import { expect, test, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test';

const LOCAL_BASE_URL = `http://127.0.0.1:${process.env.PORT || 3100}`;
const FRONTEND_BASE_URL = stripTrailingSlash(process.env.E2E_BASE_URL || LOCAL_BASE_URL);
const API_BASE_URL = stripTrailingSlash(process.env.E2E_API_BASE_URL || inferApiBaseUrl(FRONTEND_BASE_URL));
const FRONTEND_ORIGIN = new URL(FRONTEND_BASE_URL).origin;
const EXPECTED_API_HOST = new URL(API_BASE_URL).hostname;
const DISALLOWED_API_HOST = EXPECTED_API_HOST === 'api-dev.ravell.tech'
  ? 'api.ravell.tech'
  : 'api-dev.ravell.tech';

interface ApiArticle {
  title: string;
  slug: string;
  summary?: string;
  markdown_content: string;
  is_published?: boolean;
  categories?: Array<{ name: string; slug: string }>;
  tags?: Array<{ name: string; slug: string }>;
}

test.beforeAll(() => {
  assertExpectedApiBaseMatchesFrontend();
});

test.beforeEach(async ({ context }) => {
  await proxyExpectedApiWhenLocal(context);
});

test.afterEach(async ({ context }) => {
  await context.unrouteAll({ behavior: 'ignoreErrors' });
});

test('serves core routes, feeds, sitemap, robots, and indexable article HTML', async ({ request }) => {
  const article = await getPublishedArticle(request);

  const home = await request.get(frontendUrl('/'));
  expect(home.status()).toBe(200);
  expect(await home.text()).toContain('Ravell Tech');

  for (const path of ['/categories', '/tags', '/archives', '/about']) {
    const response = await request.get(frontendUrl(path));
    expect(response.status(), `${path} should return 200`).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  }

  for (const path of endpointPathsForCurrentOrigin()) {
    const response = await request.get(frontendUrl(path));
    expect(response.status(), `${path} should be reachable`).toBeLessThan(400);
  }

  const robots = await (await request.get(frontendUrl('/robots.txt'))).text();
  expect(robots).toContain('Sitemap: https://ravell.tech/sitemap.xml');
  expect(robots).not.toContain('yourdomain.com');

  const sitemap = await (await request.get(frontendUrl('/sitemap.xml'))).text();
  expect(sitemap).toContain('<loc>https://ravell.tech/articles</loc>');
  expect(sitemap).toContain(`<loc>https://ravell.tech/articles/${article.slug}</loc>`);
  expect(sitemap).not.toContain('yourdomain.com');

  for (const feedPath of ['/feed.xml', '/rss.xml', '/atom.xml']) {
    const feed = await request.get(frontendUrl(feedPath));
    expect(feed.status(), `${feedPath} should return XML from the configured API`).toBe(200);
    expect(await feed.text()).toContain(`https://ravell.tech/articles/${article.slug}`);
  }

  const articleResponse = await request.get(frontendUrl(`/articles/${article.slug}`));
  expect(articleResponse.status()).toBe(200);

  const html = await articleResponse.text();
  const text = htmlToText(html);
  expect(normalizeText(text)).toContain(normalizeText(article.title));
  expect(normalizeText(text)).toContain(normalizeText(significantMarkdownPhrase(article.markdown_content)));

  const title = getTitle(html);
  expect(title).toContain(article.title);

  const description = getMetaContent(html, 'name', 'description');
  expect(description).toBeTruthy();
  expect(normalizeText(description || '')).toContain(normalizeText(significantTextPhrase(article.summary || article.title, 40)));

  const canonical = getLinkHref(html, 'canonical');
  expect(canonical).toBeTruthy();
  expect(new URL(canonical!, FRONTEND_BASE_URL).toString()).toBe(productionCanonicalUrl(`/articles/${article.slug}`));

  const ogTitle = getMetaContent(html, 'property', 'og:title');
  const ogDescription = getMetaContent(html, 'property', 'og:description');
  const ogUrl = getMetaContent(html, 'property', 'og:url');
  expect(ogTitle).toContain(article.title);
  expect(normalizeText(ogDescription || '')).toContain(normalizeText(significantTextPhrase(article.summary || article.title, 40)));
  expect(new URL(ogUrl || '', FRONTEND_BASE_URL).toString()).toBe(productionCanonicalUrl(`/articles/${article.slug}`));
});

test('opens the article listing, uses the expected API host, and navigates to an article', async ({ page }) => {
  const issues = collectCriticalBrowserIssues(page);
  const seenApiHosts = new Set<string>();

  page.on('request', (request) => {
    const hostname = safeHostname(request.url());
    if (hostname === EXPECTED_API_HOST || hostname === DISALLOWED_API_HOST) {
      seenApiHosts.add(hostname);
    }
  });

  const expectedArticlesResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.hostname === EXPECTED_API_HOST && url.pathname.startsWith('/api/articles/');
  });

  await page.goto('/articles');
  await expectedArticlesResponse;
  await expect(page.locator('body')).toContainText(/All Articles|Knowledge Base/);

  expect(seenApiHosts.has(EXPECTED_API_HOST)).toBe(true);
  expect(seenApiHosts.has(DISALLOWED_API_HOST)).toBe(false);

  const firstArticle = page.locator('a[href^="/articles/"]:not([href="/articles"])').first();
  await expect(firstArticle).toBeVisible();
  await firstArticle.click();
  await expect(page).toHaveURL(/\/articles\/[^/?#]+/);
  await expect(page.locator('main article')).toBeVisible();

  assertNoCriticalBrowserIssues(issues);
});

test('keeps search, filters, and pagination routes free from critical browser errors', async ({ page, request }) => {
  const article = await getPublishedArticle(request);
  const filterPath = article.categories?.[0]?.slug
    ? `/articles?categories__slug=${encodeURIComponent(article.categories[0].slug)}&category_name=${encodeURIComponent(article.categories[0].name)}`
    : '/articles?search=vpn';

  for (const path of ['/articles?search=vpn', filterPath, '/articles?page=1']) {
    const issues = collectCriticalBrowserIssues(page);
    await page.goto(path);
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await expect(page.locator('body')).toContainText(/All Articles|Results for|Category Archive|Knowledge Base|Tagged Articles/);
    assertNoCriticalBrowserIssues(issues);
  }
});

test('keeps an already-open tab usable after a service worker update', async ({ context, page }) => {
  test.skip(!isServiceWorkerCapableOrigin(), 'Service worker update flow requires a secure or localhost origin.');

  const issues = collectCriticalBrowserIssues(page);
  await page.goto('/');
  await waitForActiveServiceWorker(page);
  await waitForServiceWorkerController(page);

  const currentWorker = await fetchCurrentWorkerSource(page);
  expect(currentWorker).toContain('ravell-static-v2');

  await serveSyntheticWorkerUpdate(context, currentWorker);
  expect(await activateServiceWorkerUpdate(page)).toBe(true);

  await page.locator('a[href="/articles"]').first().click();
  await expect(page).toHaveURL(/\/articles/);
  await expect(page.locator('body')).toContainText(/All Articles|Knowledge Base/);

  assertNoCriticalBrowserIssues(issues);
});

async function getPublishedArticle(request: APIRequestContext): Promise<ApiArticle> {
  const response = await request.get(apiUrl('/api/articles/?page_size=10'));
  expect(response.status()).toBe(200);

  const payload = await response.json();
  const articles: ApiArticle[] = Array.isArray(payload) ? payload : payload.results || [];
  const article = articles.find((item) => item.is_published !== false && item.slug && item.markdown_content);
  expect(article, 'expected at least one published article from the configured API').toBeTruthy();
  return article!;
}

async function proxyExpectedApiWhenLocal(context: BrowserContext) {
  if (!isLocalFrontendOrigin()) return;

  await context.route(`https://${EXPECTED_API_HOST}/api/**`, async (route) => {
    const response = await route.fetch();
    const headers = {
      ...response.headers(),
      'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    await route.fulfill({
      response,
      headers,
    });
  });
}

function collectCriticalBrowserIssues(page: Page) {
  const issues: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error' && isCriticalMessage(message.text())) {
      issues.push(`console error: ${message.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    if (isCriticalMessage(error.message)) {
      issues.push(`page error: ${error.message}`);
    }
  });

  page.on('requestfailed', (request) => {
    if (isCriticalRequestUrl(request.url())) {
      issues.push(`request failed: ${request.url()} - ${request.failure()?.errorText || 'unknown'}`);
    }
  });

  page.on('response', (response) => {
    if (isIgnoredSpeculationPrefetchRefusal(response)) return;

    if (response.status() >= 400 && isCriticalRequestUrl(response.url())) {
      issues.push(`bad response: ${response.status()} ${response.url()}`);
    }
  });

  return issues;
}

function assertNoCriticalBrowserIssues(issues: string[]) {
  expect(issues).toEqual([]);
}

function isCriticalMessage(message: string) {
  return /hydration|chunk|loading chunk|module script|syntaxerror|referenceerror|typeerror|unhandled|failed to fetch dynamically imported module/i.test(message);
}

function isCriticalRequestUrl(value: string) {
  const url = new URL(value);
  if (url.origin === FRONTEND_ORIGIN) {
    return url.pathname.startsWith('/_next/') || url.pathname.startsWith('/articles');
  }

  return url.hostname === EXPECTED_API_HOST || url.hostname === DISALLOWED_API_HOST;
}

function isIgnoredSpeculationPrefetchRefusal(response: { status(): number; headers(): Record<string, string> }) {
  return (
    response.status() === 503
    && Boolean(response.headers()['cf-speculation-refused'])
  );
}

async function waitForActiveServiceWorker(page: Page) {
  await page.waitForFunction(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active?.scriptURL.endsWith('/sw.js'));
  });
}

async function waitForServiceWorkerController(page: Page) {
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js')));
}

async function fetchCurrentWorkerSource(page: Page) {
  return page.evaluate(async () => {
    const response = await fetch('/sw.js', { cache: 'no-store' });
    return response.text();
  });
}

async function serveSyntheticWorkerUpdate(context: BrowserContext, currentWorker: string) {
  const updatedCacheName = `ravell-static-qa-${Date.now()}`;
  const updatedWorker = currentWorker.replace(/ravell-static-v2/g, updatedCacheName);
  expect(updatedWorker).not.toBe(currentWorker);

  await context.route('**/sw-qa-update.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      body: `${updatedWorker}\nself.__qa02SmokeWorker = ${JSON.stringify(updatedCacheName)};\n`,
    });
  });
}

async function activateServiceWorkerUpdate(page: Page) {
  return page.evaluate(async () => {
    return new Promise<boolean>((resolve) => {
      let finished = false;
      const finish = (value: boolean) => {
        if (!finished) {
          finished = true;
          resolve(value);
        }
      };

      const timer = window.setTimeout(() => finish(false), 15_000);

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.clearTimeout(timer);
        finish(true);
      });

      navigator.serviceWorker.register('/sw-qa-update.js', { scope: '/' }).catch(() => {
        window.clearTimeout(timer);
        finish(false);
      });
    });
  });
}

function assertExpectedApiBaseMatchesFrontend() {
  const frontendHost = new URL(FRONTEND_BASE_URL).hostname;
  if (frontendHost === 'dev.ravell.tech') {
    expect(API_BASE_URL).toBe('https://api-dev.ravell.tech');
  }
  if (frontendHost === 'ravell.tech' || frontendHost === 'www.ravell.tech') {
    expect(API_BASE_URL).toBe('https://api.ravell.tech');
  }
}

function inferApiBaseUrl(frontendBaseUrl: string) {
  const hostname = new URL(frontendBaseUrl).hostname;
  if (hostname === 'ravell.tech' || hostname === 'www.ravell.tech') {
    return 'https://api.ravell.tech';
  }
  return 'https://api-dev.ravell.tech';
}

function isServiceWorkerCapableOrigin() {
  const url = new URL(FRONTEND_BASE_URL);
  return url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

function isLocalFrontendOrigin() {
  const hostname = new URL(FRONTEND_BASE_URL).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function endpointPathsForCurrentOrigin() {
  return ['/feed.xml', '/rss.xml', '/atom.xml', '/sitemap.xml', '/robots.txt'];
}

function frontendUrl(path: string) {
  return new URL(path, `${FRONTEND_BASE_URL}/`).toString();
}

function apiUrl(path: string) {
  return new URL(path, `${API_BASE_URL}/`).toString();
}

function productionCanonicalUrl(path: string) {
  return new URL(path, 'https://ravell.tech').toString();
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function safeHostname(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
}

function getTitle(html: string) {
  return decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
}

function getMetaContent(html: string, attributeName: string, attributeValue: string) {
  const tag = findTag(html, 'meta', attributeName, attributeValue);
  return tag ? decodeHtml(getAttribute(tag, 'content') || '') : null;
}

function getLinkHref(html: string, rel: string) {
  const tag = findTag(html, 'link', 'rel', rel);
  return tag ? decodeHtml(getAttribute(tag, 'href') || '') : null;
}

function findTag(html: string, tagName: string, attributeName: string, attributeValue: string) {
  const tags = html.match(new RegExp(`<${tagName}\\b[^>]*>`, 'gi')) || [];
  return tags.find((tag) => (getAttribute(tag, attributeName) || '').toLowerCase() === attributeValue.toLowerCase()) || null;
}

function getAttribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(['"])(.*?)\\1`, 'i'));
  return match?.[2] || null;
}

function htmlToText(html: string) {
  return decodeHtml(html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '));
}

function significantMarkdownPhrase(markdown: string) {
  const text = markdown
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/[`*_>#-]/g, ' ');
  return significantTextPhrase(text, 56);
}

function significantTextPhrase(value: string, length: number) {
  const normalized = normalizeText(value);
  return normalized.length <= length ? normalized : normalized.slice(0, length).trim();
}

function normalizeText(value: string) {
  return decodeHtml(value).replace(/\s+/g, ' ').trim();
}

function decodeHtml(value: string) {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  return value.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (entity) => entities[entity] || entity);
}
