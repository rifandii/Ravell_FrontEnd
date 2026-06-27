# Ravell Networks - Frontend

Production frontend for the Ravell Networks technical blog and knowledge base.
The site serves networking, infrastructure, cloud, cybersecurity, firewall, SDN,
and automation content from the Ravell backend API.

Last reviewed: 2026-06-28

## Live Environments

| Environment | Branch | URL | Backend API | Runtime |
| --- | --- | --- | --- | --- |
| Production | `main` | `https://ravell.tech` | `https://api.ravell.tech` | Next.js App Router / SSG |
| Development / Preview | `development` | `https://dev.ravell.tech` | `https://api-dev.ravell.tech` | Next.js App Router / SSG |

The Vercel project is `ravell-networks-projects/ravell-front-end`.

## Current Runtime Status

The active production runtime is Next.js App Router with static generation:

- `npm run dev` starts `next dev`.
- `npm run build` runs `next build`.
- `npm run start` and `npm run preview` serve the built Next app.
- Article detail pages are generated with SSG and revalidated hourly.
- The previous Vite SPA remains in the repository for fallback/comparison via
  `npm run dev:vite`, `npm run build:vite`, and `npm run preview:vite`.

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
| Legacy fallback | React 19 + Vite 7 SPA |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4 |
| Routing | Next App Router; React Router DOM 7 only for legacy Vite path |
| Data fetching | Next `fetch`, Axios, TanStack React Query provider |
| Markdown | `react-markdown`, `remark-gfm` |
| Code highlighting | `react-syntax-highlighter` Prism |
| Animation | Framer Motion |
| Icons | Lucide React, Heroicons |
| SEO | Next metadata API; `react-helmet-async` only for legacy Vite path |
| Analytics/performance | Google Analytics page tracking hook, Vercel Speed Insights |
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

## Legacy Vite SPA

The former SPA remains available for comparison and rollback work:

- `src/App.tsx` and `src/main.tsx` are the Vite entry points.
- `src/vite-pages/` contains the SPA pages.
- `src/components/` contains shared and legacy UI components.
- `vite.config.ts` remains for legacy build commands only.

Use these commands only when intentionally testing the old SPA:

```bash
npm run dev:vite
npm run build:vite
npm run preview:vite
```

## Project Structure

```text
Ravell_FrontEnd/
|-- public/
|   |-- manifest.json
|   |-- sw.js
|   |-- robots.txt
|   |-- sitemap.xml
|   |-- pwa-192.png
|   |-- pwa-512.png
|   |-- maskable-icon.png
|   `-- logo/profile assets
|-- src/
|   |-- app/                        # Active Next.js App Router tree
|   |-- components/next/            # Next-specific navigation/cards/pagination
|   |-- components/                 # Shared and legacy SPA UI components
|   |-- vite-pages/                 # Legacy SPA pages
|   |-- context/GlobalContext.tsx   # Global data provider
|   |-- hooks/                      # Page tracking and active heading hooks
|   |-- services/apiClient.ts       # API client and endpoint wrappers
|   |-- types/types.ts              # Shared TypeScript API shapes
|   |-- SidebarContext.tsx
|   |-- ThemeContext.tsx
|   |-- App.tsx                     # Legacy Vite SPA router
|   `-- main.tsx                    # Legacy Vite SPA entry point
|-- vercel.json                    # Next framework override, feed rewrites, headers
|-- vite.config.ts                 # Legacy Vite build config
|-- postcss.config.mjs             # Tailwind/PostCSS support
|-- package.json
|-- package-lock.json
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

## Environment Variables

### Next.js runtime

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Public backend base URL without `/api`, for example `https://api.ravell.tech` |

### Legacy Vite runtime

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend base URL without `/api`, for legacy Vite commands |

### Vercel configuration

| Environment | Branch | Expected API base URL |
| --- | --- | --- |
| Production | `main` | `https://api.ravell.tech` |
| Preview | `development` | `https://api-dev.ravell.tech` |

For production Next.js builds, configure
`NEXT_PUBLIC_API_BASE_URL=https://api.ravell.tech` in the Vercel Production
environment. For preview builds, configure
`NEXT_PUBLIC_API_BASE_URL=https://api-dev.ravell.tech`.

Do not commit `.env`, `.env.local`, `.env.*`, or `.vercel/`. They are
gitignored and may contain local or Vercel-generated values.

## Local Development

Prerequisites:

- Node.js 20+ recommended. The Vercel project currently uses Node 24.x.
- npm is the active package manager in scripts. pnpm lock/workspace files are
  present for migration/tooling compatibility.

Setup:

```bash
git clone git@github.com:rifandii/Ravell_FrontEnd.git
cd Ravell_FrontEnd
git checkout main
npm install
```

Create a local override only when needed:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Run the active Next.js app:

```bash
npm run dev
```

Build and serve locally:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
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
- RSS/Atom feed rewrites to backend feed endpoints.
- `sw.js` cache-control.
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
- Legacy Vite files are kept only for explicit fallback/comparison commands and
  should not be treated as the active production runtime.

Cleanup completed after SSG promotion:

- Removed unused Vite/React default assets.
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
- Keep `VITE_API_BASE_URL` only for legacy Vite testing.
- When changing backend response shapes, update `src/types/types.ts` and the
  affected page/component data mapping.
- The backend can trigger Vercel deploy hooks when articles, categories, or tags
  change, if `VERCEL_DEPLOY_HOOK_URL` is configured server-side.

## Related Repository

| Repository | Description |
| --- | --- |
| `rifandii/Ravell_BackEnd` | Django + Django Ninja backend API |
