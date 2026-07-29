# Ravell Networks Frontend

Next.js App Router frontend for the Ravell Networks technical knowledge base.
It renders the public site, search and taxonomy experiences, article detail,
dynamic syndication routes, and the backend-facing revalidation route.

Last reviewed: 2026-07-24

## Tech Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16 |
| Language | TypeScript | 5.8 |
| UI Library | React | 19 |
| Styling | Tailwind CSS via PostCSS | 4 |
| Animations | Framer Motion | 12 |
| Icons | Lucide React, Heroicons | latest |
| Markdown | react-markdown + remark-gfm | 10 / 4 |
| Code Highlight | react-syntax-highlighter | 15 |
| HTTP Client | Axios (client-side) | 1.11 |
| Date | Day.js | 1 |
| Package Manager | pnpm (via Corepack) | 11.9 |
| Testing | Playwright | 1.61 |
| Linting | ESLint + typescript-eslint | 9 / 8 |
| Deployment | Vercel | — |

## What This Application Provides

- Homepage with featured content, latest articles, category and tag exploration.
- Article listing with search, filters, pagination, and article detail with
  markdown rendering, code syntax highlighting, and table of contents.
- Category, tag, and archive pages.
- Image modal, dark mode toggle, reading progress bar, scroll-to-top,
  accessible keyboard navigation, and responsive layout.
- Clear backend-unavailable, empty search, invalid filter, and not-found states.
- Dynamic `/sitemap.xml`, `/feed.xml`, `/rss.xml`, and `/atom.xml` routes.
- Signed internal `/api/internal/revalidate` endpoint for approved backend
  content-refresh flows via HMAC-SHA256 authentication.
- Service worker registration and PWA manifest support.
- Google Analytics 4 integration with privacy-respecting page view tracking.

## Delivered Controls

- **FE-01:** the supported runtime is Next.js App Router; legacy Vite is not a
  supported development, deployment, or rollback path.
- **WEB-03:** sitemap and feed routes are dynamic rather than static artifacts.
- **QA-02:** Playwright smoke coverage protects key public routes and failure
  semantics.
- **ANA-01 and OBS-01:** approved analytics and availability monitoring support
  operational visibility without embedding secrets in the client.

## Environments

| Area | Production | Development |
| --- | --- | --- |
| Public URL | `https://ravell.tech` | `https://dev.ravell.tech` |
| Backend API | `https://api.ravell.tech` | `https://api.ravell.tech` |
| Vercel target | Production | Preview alias |
| Supported runtime | Next.js App Router | Next.js App Router |
| Content revalidation | Separately promoted backend scope | Validated signed refresh flow |

Development and production are independently deployed frontend artifacts, but
both read the same canonical backend and production-visible data. A preview is
the gate for a production promotion, not an isolated backend environment.

## Architecture

```text
Browser
  -> Cloudflare (CDN + security headers)
  -> Vercel CDN and Next.js App Router (ISR + static generation)
  -> Ravell public backend API over HTTPS (Django Ninja)
```

The frontend uses public API hostnames and never connects to a raw backend
origin. API failures remain failures: they are not silently converted into an
empty list, invalid filter, or missing-article result.

### Caching Strategy

- **ISR (Incremental Static Regeneration):** pages revalidate every 3600
  seconds via `CACHE_REVALIDATE_SECONDS`.
- **Tag-based revalidation:** fine-grained cache tags (`ravell:content`,
  `ravell:articles`, `ravell:categories`, etc.) allow selective invalidation
  through the internal revalidation endpoint.
- **Service worker:** handles approved browser asset caching; does not cache
  backend API responses.

### Security Headers

Vercel configuration enforces comprehensive security headers including
HSTS, CSP, X-Frame-Options (DENY), COOP, COEP, CORP, and a strict
Permissions-Policy.

## Project Structure

```text
Ravell_FrontEnd/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout (providers, analytics, SW)
│   │   ├── LayoutClient.tsx      # Client shell (header, sidebars, navigation)
│   │   ├── page.tsx              # Homepage (server component with ISR)
│   │   ├── about/                # About page
│   │   ├── articles/             # Article listing and detail ([slug])
│   │   ├── categories/           # Category pages
│   │   ├── tags/                 # Tag pages
│   │   ├── archives/             # Archive pages
│   │   ├── api/internal/         # Internal revalidation API route
│   │   ├── sitemap.xml/          # Dynamic sitemap route
│   │   ├── feed.xml/             # Dynamic RSS feed route
│   │   ├── rss.xml/              # Dynamic RSS route
│   │   └── atom.xml/             # Dynamic Atom feed route
│   ├── components/               # Shared UI components
│   │   ├── next/                 # Next.js-specific components
│   │   │   ├── HeaderNext.tsx    # Site header with expanding search
│   │   │   ├── SidebarNext.tsx   # Primary navigation sidebar
│   │   │   ├── RightSidebarNext.tsx  # Contextual right sidebar
│   │   │   ├── ArticleCardNext.tsx   # Article card component
│   │   │   ├── PaginationNext.tsx    # Pagination component
│   │   │   └── CategoryItemNext.tsx  # Category item component
│   │   ├── MarkdownRenderer.tsx  # Markdown content renderer
│   │   ├── CodeBlock.tsx         # Syntax-highlighted code blocks
│   │   ├── ImageModal.tsx        # Full-screen image modal
│   │   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │   ├── SkeletonCard.tsx      # Loading skeleton component
│   │   ├── ReadingProgressBar.tsx    # Article reading progress
│   │   ├── ScrollToTopButton.tsx     # Scroll-to-top button
│   │   ├── BackendUnavailable.tsx    # Backend outage state
│   │   ├── AnalyticsPageView.tsx     # GA4 page view tracking
│   │   └── ServiceWorkerRegistration.tsx  # SW registration
│   ├── lib/                      # Core utilities
│   │   ├── backendFetch.ts       # Server-side fetch with ISR support
│   │   ├── backendFailure.ts     # Backend failure error types
│   │   ├── cachePolicy.ts       # ISR cache tags and revalidation logic
│   │   ├── publicSyndication.ts  # Sitemap and feed proxy
│   │   └── revalidationAuth.ts  # HMAC-SHA256 revalidation auth
│   ├── services/
│   │   └── apiClient.ts          # Axios-based client-side API client
│   ├── context/
│   │   └── GlobalContext.tsx      # Global navigation data provider
│   ├── types/
│   │   ├── types.ts              # Frontend view models
│   │   ├── api-contracts.ts      # API contract type assertions
│   │   └── generated/            # Auto-generated OpenAPI types
│   ├── SidebarContext.tsx        # Sidebar state provider
│   ├── ThemeContext.tsx          # Theme state provider
│   └── index.css                 # Global stylesheet (Tailwind entry)
├── public/                       # Static assets (icons, manifest, SW)
├── scripts/
│   └── generate-api-types.mjs    # OpenAPI type generation script
├── tests/e2e/                    # Playwright E2E tests
├── docs/
│   └── ui-ux-baseline.md         # Approved UI/UX visual contract
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── eslint.config.js
├── postcss.config.mjs
├── playwright.config.ts
└── vercel.json                   # Vercel headers and deployment config
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage with featured and latest articles |
| `/articles` | Listing, search, filters, and pagination |
| `/articles/[slug]` | Article detail with markdown rendering |
| `/categories`, `/tags`, `/archives` | Taxonomy and archive views |
| `/about` | About page |
| `/sitemap.xml`, `/feed.xml`, `/rss.xml`, `/atom.xml` | Dynamic syndication |
| `/api/internal/revalidate` | Internal signed revalidation endpoint |

## Local Development

Prerequisites: Node.js compatible with the project and Corepack.

```bash
git checkout development
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

The dev server starts at `http://localhost:3000` by default.

### Validation Gates

Before a release, run the relevant project gates:

```bash
corepack pnpm run typecheck       # TypeScript type checking
corepack pnpm run lint            # ESLint linting
corepack pnpm run api:types:check # API contract validation
corepack pnpm run build           # Production build
corepack pnpm run test:e2e:smoke  # Playwright smoke tests
```

### API Type Generation

The frontend consumes backend API types generated from the OpenAPI schema:

```bash
corepack pnpm run api:types       # Regenerate types from backend schema
corepack pnpm run api:types:check # Verify types match current schema
```

## Release Workflow

1. Validate the scoped change locally and in CI.
2. Deploy or inspect the exact Vercel preview for the candidate SHA.
3. Check public routes, error semantics, and dynamic sitemap/feed behavior.
4. Promote only the reviewed artifact to production after owner approval.
5. Roll back by promoting the prior known-good Vercel deployment; do not rebuild
   a different artifact during an incident.

## Branch Model

```text
local development
  → origin/development
  → validation
  → pull request development to main
  → Vercel production promotion
  → production validation
  → main fast-forward sync back to development
```

Normal work starts from `development`. Do not edit `main` directly.

## UI and Operations

The approved visual and interaction contract is
[`docs/ui-ux-baseline.md`](docs/ui-ux-baseline.md). Treat it as
change-controlled: do not alter layout, navigation, article behavior, or visual
states without explicit approval.

External UptimeRobot checks cover public availability. They confirm external
reachability and HTTP availability, not rendered-content correctness. Browser
smoke tests remain the verification for user-facing behavior.

Environment variables provide backend URLs, internal revalidation configuration,
and deployment-specific settings. Never commit values, tokens, or `.env` files.

For API, editorial admin, releases, observability, and recovery, see the
companion [backend repository](../Ravell_BackEnd/README.md).
