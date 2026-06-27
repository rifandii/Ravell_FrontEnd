# Ravell Networks - Frontend

Frontend for the Ravell Networks technical blog and knowledge base. The public
site serves networking, infrastructure, cloud, cybersecurity, firewall, SDN, and
automation content from the Ravell backend API.

Last reviewed: 2026-06-27

## Live Environments

| Environment | Branch | URL | Backend API |
| --- | --- | --- | --- |
| Production | `main` | `https://ravell.tech` | `https://api.ravell.tech` |
| Development / Preview | `development` | `https://dev.ravell.tech` | `https://api-dev.ravell.tech` |

The Vercel project is `ravell-networks-projects/ravell-front-end`.

## Current Runtime Status

This repository currently contains two frontend tracks:

- Active runtime: React 19 + Vite 7 SPA. The package scripts still run Vite:
  `npm run dev`, `npm run build`, `npm run preview`, and `npm run lint`.
- Migration track: Next.js App Router / SSG files under `src/app` plus
  `src/components/next`. These files are present on the `development` branch
  and prepare the site for a possible static-generation migration. They are not
  the active production runtime until the build scripts and Vercel project are
  intentionally switched to Next.js.

Keep this distinction clear when reviewing branches:

- `main` is the production branch.
- `development` includes newer Next.js migration work and should be verified on
  the preview environment before merging.

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
Vercel CDN / Build Output
  |
  | API calls through VITE_API_BASE_URL or NEXT_PUBLIC_API_BASE_URL
  v
Tencent Cloud VM
  |
  v
Nginx -> Gunicorn -> Django Ninja API
```

## Technology Stack

| Area | Technology |
| --- | --- |
| UI runtime | React 19 |
| Active build tool | Vite 7 |
| Migration target | Next.js 16 App Router / SSG |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 for Vite SPA; Next App Router files for migration |
| Data fetching | Axios, TanStack React Query provider |
| Markdown | `react-markdown`, `remark-gfm` |
| Code highlighting | `react-syntax-highlighter` Prism |
| Animation | Framer Motion |
| Icons | Lucide React, Heroicons |
| SEO | `react-helmet-async` for Vite; Next metadata API in migration files |
| Analytics/performance | Google Analytics page tracking hook, Vercel Speed Insights |
| PWA/static assets | `manifest.json`, `sw.js`, maskable icons, PWA icons |

## Feature Overview

### Active Vite SPA

- Lazy-loaded page routes for home, article list, article detail, categories,
  tags, archives, about, and 404.
- Persistent dark/light theme via `ThemeContext`.
- Sidebar state via `SidebarContext`.
- Left navigation sidebar and context-aware right sidebar.
- Article list filtering by category, tag, search, year, and month.
- Tag/category filter validation against the API, with corrected display names
  pushed back into the URL when needed.
- Server-driven pagination compatible with the backend's DRF-style pagination
  envelope.
- Article detail pages with:
  - SEO metadata.
  - Breadcrumbs.
  - tags.
  - dynamic reading-time estimate.
  - featured image lightbox.
  - generated table-of-contents headings from markdown `h2` and `h3`.
  - previous/next article navigation.
  - random "you might also like" article recommendations.
- GitHub-flavored markdown rendering with tables, blockquotes, headings, and
  image captions.
- Premium code block component with:
  - syntax highlighting.
  - line numbers.
  - copy-to-clipboard.
  - external raw-code window.
  - optional hover line highlighting.
- Skeleton loading states for page and article layouts.
- Content update notification using the lightweight
  `/api/content/signature/` endpoint.
- Service worker update notification and refresh flow.
- Page-view tracking hook for Google Analytics.
- Vercel Speed Insights.

### Next.js Migration Track

The `src/app` tree includes an App Router version of the site:

- root layout with theme/sidebar/global providers.
- home, articles, article detail, categories, tags, archives, and about pages.
- article detail SSG helpers:
  - `generateStaticParams`.
  - `generateMetadata`.
  - server-side article fetching with revalidation.
- client helper components for article interactions.
- Next-specific sidebar, header, card, pagination, and category components under
  `src/components/next`.

This track should be treated as migration work until the deployment pipeline is
changed from Vite to Next.js.

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
|   |-- App.tsx                     # Active Vite SPA router
|   |-- main.tsx                    # Vite SPA entry point
|   |-- index.css                   # Tailwind 4 global styles
|   |-- vite-pages/                 # Active SPA pages
|   |-- app/                        # Next.js App Router migration track
|   |-- components/                 # Shared SPA UI components
|   |-- components/next/            # Next migration components
|   |-- context/GlobalContext.tsx   # Global data provider for Next track
|   |-- hooks/                      # Page tracking and active heading hooks
|   |-- services/apiClient.ts       # API client and endpoint wrappers
|   |-- types/types.ts              # Shared TypeScript API shapes
|   |-- SidebarContext.tsx
|   `-- ThemeContext.tsx
|-- vercel.json                    # Rewrites and security headers
|-- vite.config.ts                 # Active Vite build config
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

### Vite runtime

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend base URL without `/api`, for example `https://api.ravell.tech` |

### Next.js migration track

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL without `/api`, used by App Router files |

### Vercel configuration

| Environment | Branch | Expected API base URL |
| --- | --- | --- |
| Production | `main` | `https://api.ravell.tech` |
| Preview | `development` | `https://api-dev.ravell.tech` |

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
git checkout development
npm install
```

Create a local override only when needed:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Run the active Vite SPA:

```bash
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
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

- RSS/Atom feed rewrites to the production backend feed endpoints.
- SPA fallback rewrite to `/index.html`.
- `sw.js` cache-control.
- security headers including HSTS, frame denial, content-type nosniff,
  permissions policy, COOP/COEP/CORP, and CSP.

## Branch Workflow

1. Build features on `development`.
2. Verify the preview frontend at `https://dev.ravell.tech`.
3. Verify API compatibility against `https://api-dev.ravell.tech`.
4. Open or merge a PR from `development` to `main` only after approval.
5. Confirm production at `https://ravell.tech` after Vercel completes the build.

## Maintenance Notes

- Keep `VITE_API_BASE_URL` in Vercel aligned with the branch environment.
- When changing backend response shapes, update `src/types/types.ts` and the
  affected page/component data mapping.
- If the Next.js migration becomes the production path, update `package.json`
  scripts, Vercel build settings, and this README's "Current Runtime Status".
- The backend can trigger Vercel deploy hooks when articles, categories, or tags
  change, if `VERCEL_DEPLOY_HOOK_URL` is configured server-side.

## Related Repository

| Repository | Description |
| --- | --- |
| `rifandii/Ravell_BackEnd` | Django + Django Ninja backend API |
