export const CACHE_REVALIDATE_SECONDS = 3600;

export const CACHE_TAGS = {
  CONTENT: 'ravell:content',
  ARTICLES: 'ravell:articles',
  ARTICLES_LIST: 'ravell:articles:list',
  ARTICLES_LATEST: 'ravell:articles:latest',
  CATEGORIES: 'ravell:categories',
  TAGS: 'ravell:tags',
  ARCHIVES: 'ravell:archives',
  SITEMAP: 'ravell:sitemap',
  FEED: 'ravell:feed',
} as const;

const FIXED_CONTENT_PATHS = new Set([
  '/',
  '/articles',
  '/categories',
  '/tags',
  '/archives',
  '/sitemap.xml',
  '/feed.xml',
]);

const STATIC_TAGS = new Set<string>(Object.values(CACHE_TAGS));
const ARTICLE_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,199}$/;
const ARTICLE_TAG_PATTERN = /^ravell:article:[a-z0-9][a-z0-9-]{0,199}$/;
const ARTICLE_PATH_PATTERN = /^\/articles\/[a-z0-9][a-z0-9-]{0,199}$/;
const MAX_REVALIDATION_ITEMS = 100;
const MAX_REVALIDATION_ITEM_LENGTH = 240;

const ARTICLE_ACTIONS = new Set(['created', 'updated', 'published', 'unpublished', 'deleted']);
const CATEGORY_TAG_ACTIONS = new Set(['created', 'updated', 'deleted']);
const ACTIONS_BY_MODEL = {
  article: ARTICLE_ACTIONS,
  category: CATEGORY_TAG_ACTIONS,
  tag: CATEGORY_TAG_ACTIONS,
} as const;

type ContentModel = keyof typeof ACTIONS_BY_MODEL;

export interface ContentRevalidationPayload {
  model: ContentModel;
  action: string;
  slugs: string[];
  tags: string[];
  paths: string[];
}

export function articleDetailTag(slug: string) {
  return `ravell:article:${slug}`;
}

function normalizeSlug(slug: string) {
  return slug;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isBoundedStringArray(value: unknown): value is string[] {
  return Array.isArray(value)
    && value.length <= MAX_REVALIDATION_ITEMS
    && value.every((item) => typeof item === 'string' && item.length > 0 && item.length <= MAX_REVALIDATION_ITEM_LENGTH);
}

function optionalStringArray(value: unknown) {
  if (value === undefined) return [];
  return isBoundedStringArray(value) ? value : null;
}

function isAllowedTag(tag: unknown) {
  return typeof tag === 'string' && (STATIC_TAGS.has(tag) || ARTICLE_TAG_PATTERN.test(tag));
}

function isAllowedPath(path: unknown) {
  return typeof path === 'string' && (FIXED_CONTENT_PATHS.has(path) || ARTICLE_PATH_PATTERN.test(path));
}

function addArticleTargets(tags: Set<string>, paths: Set<string>, slug: string) {
  tags.add(articleDetailTag(slug));
  paths.add(`/articles/${slug}`);
}

export function parseContentRevalidationPayload(input: unknown): ContentRevalidationPayload | null {
  if (!isPlainObject(input)) return null;

  const model = typeof input.model === 'string' ? input.model.toLowerCase() : '';
  if (!(model in ACTIONS_BY_MODEL)) return null;

  const action = typeof input.action === 'string' ? input.action.toLowerCase() : '';
  if (!ACTIONS_BY_MODEL[model as ContentModel].has(action)) return null;

  const slugs = optionalStringArray(input.slugs);
  const tags = optionalStringArray(input.tags);
  const paths = optionalStringArray(input.paths);
  if (!slugs || !tags || !paths) return null;
  if (!slugs.every((slug) => ARTICLE_SLUG_PATTERN.test(slug))) return null;
  if (!tags.every(isAllowedTag)) return null;
  if (!paths.every(isAllowedPath)) return null;

  return {
    model: model as ContentModel,
    action,
    slugs,
    tags,
    paths,
  };
}

export function resolveContentRevalidationTargets(payload: ContentRevalidationPayload) {
  const tags = new Set<string>();
  const paths = new Set<string>();
  const slugs = payload.slugs.map(normalizeSlug);

  for (const tag of payload.tags) {
    if (isAllowedTag(tag)) tags.add(tag);
  }

  for (const path of payload.paths) {
    if (isAllowedPath(path)) paths.add(path);
  }

  tags.add(CACHE_TAGS.CONTENT);
  tags.add(CACHE_TAGS.SITEMAP);
  tags.add(CACHE_TAGS.FEED);
  paths.add('/');
  paths.add('/articles');
  paths.add('/sitemap.xml');
  paths.add('/feed.xml');

  if (payload.model === 'article') {
    tags.add(CACHE_TAGS.ARTICLES);
    tags.add(CACHE_TAGS.ARTICLES_LIST);
    tags.add(CACHE_TAGS.ARTICLES_LATEST);
    tags.add(CACHE_TAGS.ARCHIVES);
    paths.add('/archives');
    for (const slug of slugs) addArticleTargets(tags, paths, slug);
  }

  if (payload.model === 'category') {
    tags.add(CACHE_TAGS.ARTICLES);
    tags.add(CACHE_TAGS.ARTICLES_LIST);
    tags.add(CACHE_TAGS.CATEGORIES);
    paths.add('/categories');
  }

  if (payload.model === 'tag') {
    tags.add(CACHE_TAGS.ARTICLES);
    tags.add(CACHE_TAGS.ARTICLES_LIST);
    tags.add(CACHE_TAGS.TAGS);
    paths.add('/tags');
  }

  return {
    tags: [...tags].sort(),
    paths: [...paths].sort(),
  };
}
