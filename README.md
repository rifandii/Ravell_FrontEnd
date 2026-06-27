# Ravell Networks - Frontend

Production frontend for the Ravell Networks technical blog and knowledge base.
The site serves networking, infrastructure, cloud, cybersecurity, firewall, SDN,
and automation content from the Ravell backend API.

Last reviewed: 2026-06-27

## Live Environments

| Environment | Branch | URL | Backend API |
| --- | --- | --- | --- |
| Production | `main` | `https://ravell.tech` | `https://api.ravell.tech` |
| Development / Preview | `development` | `https://dev.ravell.tech` | `https://api-dev.ravell.tech` |

The Vercel project is `ravell-networks-projects/ravell-front-end`.

## Current Branch Status

This `main` branch is the production frontend. It is a React 19 + Vite 7
single-page application deployed on Vercel.

The `development` branch contains newer migration work for Next.js App Router
and static generation. Do not assume the Next.js files are part of production
until the deployment pipeline is intentionally switched from Vite to Next.js.

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
Vercel CDN / Vite build output
  |
  | API calls through VITE_API_BASE_URL
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
| Build tool | Vite 7 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| Data fetching | Axios, TanStack React Query provider |
| Markdown | `react-markdown`, `remark-gfm` |
| Code highlighting | `react-syntax-highlighter` Prism |
| Animation | Framer Motion |
| Icons | Lucide React, Heroicons |
| SEO | `react-helmet-async` |
| Analytics/performance | Google Analytics page tracking hook, Vercel Speed Insights |
| PWA/static assets | `manifest.json`, `sw.js`, maskable icons, PWA icons |

## Feature Overview

- Lazy-loaded SPA routes for home, article list, article detail, categories,
  tags, archives, about, and 404.
- Persistent dark/light theme via `ThemeContext`.
- Sidebar state via `SidebarContext`.
- Left navigation sidebar and context-aware right sidebar.
- Article list filtering by category, tag, search, year, and month.
- Tag/category filter validation against the API.
- Server-driven pagination compatible with the backend's DRF-style pagination
  envelope.
- Article detail pages with SEO metadata, breadcrumbs, tags, reading-time
  estimate, featured image lightbox, table-of-contents headings, previous/next
  article navigation, and random recommendations.
- GitHub-flavored markdown rendering with tables, blockquotes, headings, image
  captions, and custom code blocks.
- Premium code block component with syntax highlighting, line numbers,
  copy-to-clipboard, external raw-code window, and optional hover highlighting.
- Skeleton loading states for page and article layouts.
- Content update notification using `/api/content/signature/`.
- Service worker update notification and refresh flow.
- Page-view tracking hook for Google Analytics.
- Vercel Speed Insights.

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
|   |-- App.tsx
|   |-- main.tsx
|   |-- index.css
|   |-- vite-pages/
|   |-- components/
|   |-- hooks/
|   |-- services/apiClient.ts
|   |-- types/types.ts
|   |-- SidebarContext.tsx
|   `-- ThemeContext.tsx
|-- vercel.json
|-- vite.config.ts
|-- package.json
`-- package-lock.json
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

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend base URL without `/api`, for example `https://api.ravell.tech` |

Vercel environment mapping:

| Environment | Branch | Expected API base URL |
| --- | --- | --- |
| Production | `main` | `https://api.ravell.tech` |
| Preview | `development` | `https://api-dev.ravell.tech` |

Do not commit `.env`, `.env.local`, `.env.*`, or `.vercel/`. They are
gitignored and may contain local or Vercel-generated values.

## Local Development

Prerequisites:

- Node.js 20+ recommended. The Vercel project currently uses Node 24.x.
- npm.

Setup:

```bash
git clone git@github.com:rifandii/Ravell_FrontEnd.git
cd Ravell_FrontEnd
git checkout main
npm install
```

Create a local override only when needed:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Run locally:

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

Useful CLI checks:

```bash
npx vercel@latest whoami
npx vercel@latest project ls
npx vercel@latest env ls
```

`vercel.json` configures RSS/Atom rewrites, SPA fallback, `sw.js`
cache-control, and security headers.

## Branch Workflow

1. Build features on `development`.
2. Verify the preview frontend at `https://dev.ravell.tech`.
3. Verify API compatibility against `https://api-dev.ravell.tech`.
4. Merge to `main` only after approval.
5. Confirm production at `https://ravell.tech` after Vercel completes the build.

## Maintenance Notes

- Keep `VITE_API_BASE_URL` in Vercel aligned with the branch environment.
- When changing backend response shapes, update `src/types/types.ts`.
- If the Next.js migration becomes production, update `package.json` scripts,
  Vercel build settings, and this README.
- The backend can trigger Vercel deploy hooks when articles, categories, or tags
  change, if `VERCEL_DEPLOY_HOOK_URL` is configured server-side.

## Related Repository

| Repository | Description |
| --- | --- |
| `rifandii/Ravell_BackEnd` | Django + Django Ninja backend API |
