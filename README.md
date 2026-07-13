# Ravell Networks - Frontend

Production frontend for the Ravell Networks technical blog and knowledge base.
The site serves networking, infrastructure, cloud, cybersecurity, firewall, SDN,
and automation content from the Ravell backend API.

Last reviewed: 2026-07-13

## Live Environments

| Environment | Branch | URL | Backend API | Runtime |
| --- | --- | --- | --- | --- |
| Production | `main` | `https://ravell.tech` | `https://api.ravell.tech` | Next.js App Router / SSG |
| Development / Preview | `development` | `https://dev.ravell.tech` | `https://api-dev.ravell.tech` | Next.js App Router / SSG |

The Vercel project is `ravell-networks-projects/ravell-front-end`.

## Current Runtime Status

The active production runtime is Next.js App Router with static generation:

- `corepack pnpm run dev` starts `next dev`.
- `corepack pnpm run build` runs `next build`.
- `corepack pnpm run start` and `corepack pnpm run preview` serve the built Next app.
- `corepack pnpm run typecheck` runs TypeScript project validation.
- `corepack pnpm run api:types` regenerates API contracts from the backend OpenAPI
  artifact.
- `corepack pnpm run api:types:check` verifies generated API contract drift.
- `corepack pnpm run test:e2e` runs Playwright browser regression tests.
- `corepack pnpm run test:e2e:smoke` runs the QA-02 Next.js regression smoke suite.
- Article detail pages are generated with SSG and revalidated hourly.
- Next.js is the only source-controlled frontend runtime. Historical Vite
  rollback evidence remains available through Git and Vercel deployment history.

## Architecture

```text
Browser
  |
  | HTTPS
  v
Cloudflare
  |
  | Frontend routes
  v
Vercel CDN / Next.js build output
  |
  | Server/client API calls through NEXT_PUBLIC_API_BASE_URL
  v
Tencent Cloud VM
  |
  v
Nginx -> Gunicorn -> Django Ninja API
```

## Technology Stack

| Area | Technology |
| --- | --- |
| Active runtime | Next.js 16 App Router |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4 |
| Routing | Next App Router |
| Data fetching | Next `fetch`, Axios |
| Markdown | `react-markdown`, `remark-gfm` |
| Code highlighting | `react-syntax-highlighter` Prism |
| Animation | Framer Motion |
| Icons | Lucide React, Heroicons |
| SEO | Next metadata API |
| Analytics | Direct GA4 page-view tracking from Next App Router |
| PWA/static assets | `manifest.json`, `sw.js`, maskable icons, PWA icons |

## Next.js / SSG Scope

Implemented in `src/app` and active on production:

- Root layout with theme, sidebar, and global providers.
- Static home page with ISR revalidation.
- Static categories, tags, archives, and about pages.
- Article detail route `/articles/[slug]` with:
  - `generateStaticParams` for article slug pre-rendering.
  - `generateMetadata` for per-article SEO and social metadata.
  - hourly revalidation for article content.
  - previous/next article navigation.
  - markdown rendering and client-side table-of-contents/image interactions.
- Client-side article list route `/articles` for dynamic filters, search,
  category/tag validation, archive filters, and pagination.
- Next-specific sidebar, header, cards, pagination, and recursive category UI
  under `src/components/next`.

Expected build output:

```text
/                         static, revalidate 1h
/about                    static
/archives                 static, revalidate 1h
/articles                 static shell with client-side filtering
/articles/[slug]          SSG using generateStaticParams, revalidate 1h
/categories               static, revalidate 1h
/tags                     static
```

## PWA and Cache Policy

The active Next.js runtime registers `/sw.js` only in production builds. The
service worker is intentionally conservative:

- document navigation and article routes are not cached by the service worker;
- `/index.html` is not precached and is never used as an App Router fallback;
- backend API requests pass through without service-worker caching;
- cache-first behavior is limited to same-origin fingerprinted assets under
  `/_next/static/`;
- legacy SPA caches `ravell-cache-v1`, `ravell-assets-v1`, and
  `ravell-images-v1` are deleted during the v2 activation path;
- unrelated `ravell-*` caches are preserved unless they are in the
  `ravell-static-*` namespace.

The detailed policy and migration behavior are documented in
`docs/frontend/cache-policy.md`.

## Project Structure

```text
Ravell_FrontEnd/
|-- docs/
|   `-- frontend/
|       |-- api-contracts.md
|       |-- analytics-ownership.md
|       `-- cache-policy.md
|-- public/
|   |-- manifest.json
|   |-- sw.js
|   |-- robots.txt
|   |-- pwa-192.png
|   |-- pwa-512.png
|   |-- maskable-icon.png
|   `-- logo/profile assets
|-- src/
|   |-- app/                        # Active Next.js App Router tree
|   |-- components/next/            # Next-specific navigation/cards/pagination
|   |-- components/                 # Shared App Router UI components
|   |-- context/GlobalContext.tsx   # Global data provider
|   |-- services/apiClient.ts       # API client and endpoint wrappers
|   |-- types/generated/            # Generated OpenAPI snapshot and TS contracts
|   |-- types/api-contracts.ts      # Transport contract aliases
|   |-- types/types.ts              # Shared TypeScript API shapes
|   |-- SidebarContext.tsx
|   `-- ThemeContext.tsx
|-- vercel.json                    # Next framework override and headers
|-- postcss.config.mjs             # Tailwind/PostCSS support
|-- package.json
|-- pnpm-lock.yaml
`-- pnpm-workspace.yaml
```

## API Endpoints Consumed

| Endpoint | Purpose |
| --- | --- |
| `GET /api/articles/` | Paginated article listing with filters |
| `GET /api/articles/{slug}/` | Article detail |
| `GET /api/articles/latest/` | Latest articles for home/sidebar |
| `GET /api/articles/random_articles/` | Further-reading recommendations |
| `GET /api/categories/` | Hierarchical categories |
| `GET /api/categories/{slug}/` | Category validation/detail |
| `GET /api/tags/` | Tags and tag counts |
| `GET /api/tags/{slug}/` | Tag validation/detail |
| `GET /api/archives/` | Year/month archive navigation |
| `GET /api/images/` | Image list |
| `GET /api/content/signature/` | Lightweight content-change polling |

## API Contract Workflow

Backend Django Ninja OpenAPI is the API source of truth. The frontend generated
artifacts are:

```text
src/types/generated/ravell-api.openapi.json
src/types/generated/api.ts
```

Regenerate and validate them with:

```bash
corepack pnpm run api:types
corepack pnpm run api:types:check
corepack pnpm run typecheck
```

Generated transport contracts stay separated from frontend view models. The
compatibility boundary is `src/types/api-contracts.ts`; UI components should
continue to consume the view models from `src/types/types.ts` unless a deliberate
adapter migration is being made.

Detailed workflow and ownership rules are documented in
`docs/frontend/api-contracts.md`.

## Environment Variables

### Next.js runtime

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Public backend base URL without `/api`, for example `https://api.ravell.tech` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional GA4 measurement ID used by the App Router page-view tracker |

### Vercel configuration

| Environment | Branch | Expected API base URL |
| --- | --- | --- |
| Production | `main` | `https://api.ravell.tech` |
| Preview | `development` | `https://api-dev.ravell.tech` |

For production Next.js builds, configure
`NEXT_PUBLIC_API_BASE_URL=https://api.ravell.tech` in the Vercel Production
environment. For preview builds, configure
`NEXT_PUBLIC_API_BASE_URL=https://api-dev.ravell.tech`.

GA4 page-view tracking is owned by the active Next.js runtime and documented in
`docs/frontend/analytics-ownership.md`. Do not hard-code analytics IDs in
source files; configure `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel environments
where analytics should run.

Canonical URLs intentionally resolve to `https://ravell.tech` for both
production and preview/development builds. `dev.ravell.tech` should render the
same article metadata but keep canonical and Open Graph URLs pointed at the
production host to avoid indexing preview content as a duplicate origin.

Do not commit `.env`, `.env.local`, `.env.*`, or `.vercel/`. They are
gitignored and may contain local or Vercel-generated values.

## Local Development

Prerequisites:

- Node.js 20+ recommended. The Vercel project currently uses Node 24.x.
- pnpm is the active package manager. Use the version declared in
  `packageManager` through Corepack.

Setup:

```bash
git clone git@github.com:rifandii/Ravell_FrontEnd.git
cd Ravell_FrontEnd
git checkout main
corepack enable
corepack pnpm install --frozen-lockfile
```

Create a local override only when needed:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Run the active Next.js app:

```bash
corepack pnpm run dev
```

Build and serve locally:

```bash
corepack pnpm run build
corepack pnpm run start
```

Lint:

```bash
corepack pnpm run lint
```

Browser regression tests:

```bash
corepack pnpm run build
corepack pnpm run test:e2e
```

QA-02 Next.js smoke tests against development:

```powershell
$env:E2E_BASE_URL='https://dev.ravell.tech'
$env:E2E_API_BASE_URL='https://api-dev.ravell.tech'
corepack pnpm run test:e2e:smoke
```

QA-02 read-only production smoke tests:

```powershell
$env:E2E_BASE_URL='https://ravell.tech'
$env:E2E_API_BASE_URL='https://api.ravell.tech'
corepack pnpm run test:e2e:smoke
```

API contract validation:

```bash
corepack pnpm run api:types:check
corepack pnpm run typecheck
```

## Vercel Deployment

Vercel is connected to the GitHub repository and deploys by branch:

- push to `main`: production deployment at `https://ravell.tech`.
- push to `development`: preview/development deployment at
  `https://dev.ravell.tech`.

The local checkout is linked to:

```text
ravell-networks-projects/ravell-front-end
```

Useful CLI checks:

```bash
npx vercel@latest whoami
npx vercel@latest project ls
npx vercel@latest env ls
```

`vercel.json` configures:

- Vercel framework override to `nextjs`.
- `sw.js` cache-control.
- PWA service-worker cache migration is documented in
  `docs/frontend/cache-policy.md`.
- direct GA4 page-view ownership is documented in
  `docs/frontend/analytics-ownership.md`.
- security headers including HSTS, frame denial, content-type nosniff,
  permissions policy, COOP/COEP/CORP, and CSP.

The old SPA fallback rewrite to `/index.html` is intentionally removed because
it conflicts with Next App Router routing.

## Production SSG Verification

After the migration, production article URLs are expected to expose title,
summary, metadata, and article body in the initial HTML. This is the behavior
that enables Telegram and other Open Graph consumers to show article previews
without executing client-side JavaScript.

Verified production checks:

- `https://ravell.tech/articles/deploying-ipsec-site-to-site-vpns-with-ftd`
  returns `200`.
- Response is `text/html; charset=utf-8`.
- Vercel reports `x-vercel-cache: PRERENDER` and `x-nextjs-prerender: 1`.
- The article title and body are present in page source.
- `/`, `/categories`, `/tags`, and `/archives` also return prerendered HTML.

## Code Hygiene Policy

- Remove unused demo/default assets instead of leaving migration debris in the
  production tree.
- Keep comments for architectural boundaries, SSG/ISR behavior, API/runtime
  compatibility, and non-obvious UI logic.
- Do not add line-by-line comments that merely repeat the code; those comments
  rot quickly and make future changes harder to review.
- Historical pre-Next source remains available from Git history and the
  `prod-frontend-pre-next-ssg-20260628` rollback tag, not in the active tree.

Cleanup completed after SSG promotion:

- Retired the legacy Vite runtime, React Router components, and duplicate npm
  lockfile after the FE-01 stability gate.
- Removed the unused Supabase SEO demo component and its private helper.
- Replaced debug/noisy service-worker logs with quieter failure warnings.
- Fixed invalid Tailwind utility names in sidebar/tag UI.
- Added comments around SSG, ISR, Open Graph metadata, query-driven article
  listing, markdown rendering, and runtime API selection.

## Rollback

The safest rollback options are:

- Vercel rollback to the previous production deployment.
- Git revert of the merge commit that promoted Next.js to `main`.
- Git tag rollback point: `prod-frontend-pre-next-ssg-20260628`.

## Branch Workflow

1. Build features on `development`.
2. Verify the preview frontend at `https://dev.ravell.tech`.
3. Verify API compatibility against `https://api-dev.ravell.tech`.
4. Merge to `main` only after QA approval.
5. Confirm production at `https://ravell.tech` after Vercel completes the
   build.

## Maintenance Notes

- Keep `NEXT_PUBLIC_API_BASE_URL` aligned with the branch environment.
- When changing backend response shapes, regenerate API contracts with
  `corepack pnpm run api:types`, then update `src/types/types.ts` and affected
  page/component data mapping only if the frontend view model changes.
- The backend can trigger Vercel deploy hooks when articles, categories, or tags
  change, if `VERCEL_DEPLOY_HOOK_URL` is configured server-side.

## Related Repository

| Repository | Description |
| --- | --- |
| `rifandii/Ravell_BackEnd` | Django + Django Ninja backend API |
