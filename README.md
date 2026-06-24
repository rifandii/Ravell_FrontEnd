# 🌐 Ravell Networks — Frontend

The frontend application for the **Ravell Networks** tech blog and knowledge base. A high-performance single-page application (SPA) built with React and Vite, designed for professionals in **Network Engineering** and **Cybersecurity**.

**Production**: [https://ravell.tech](https://ravell.tech)
**Development**: [https://dev.ravell.tech](https://dev.ravell.tech)

---

## 📋 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Technology Stack](#-technology-stack)
3. [Project Structure](#-project-structure)
4. [Key Features](#-key-features)
5. [Environment Configuration](#-environment-configuration)
6. [Local Development Setup](#-local-development-setup)
7. [Deployment (Vercel)](#-deployment-vercel)
8. [Dual-Environment Workflow](#-dual-environment-workflow)
9. [Cloudflare & Security](#-cloudflare--security)
10. [Related Repositories](#-related-repositories)

---

## 🏛️ Architecture Overview

```
╔══════════════════════════════════════════════════════════════════╗
║                         CLIENT / USER                           ║
║                    (Browser / Mobile App)                        ║
╚══════════════════════════════╦═══════════════════════════════════╝
                               ║
                               ▼ [HTTPS Request via Cloudflare]
╔══════════════════════════════════════════════════════════════════╗
║                    CLOUDFLARE EDGE SERVERS                       ║
║        SSL/TLS (Full Strict), DDoS & Bot Mitigation, WAF        ║
╚══════════════════════════════╦═══════════════════════════════════╝
                               ║
             ┌─────────────────┴─────────────────┐
             ▼ [Route Frontend]                  ▼ [Route Backend API]
╔═════════════════════════════╗     ╔═════════════════════════════╗
║      VERCEL HOSTING         ║     ║   TENCENT CLOUD LIGHTHOUSE  ║
║   https://ravell.tech       ║     ║   https://api.ravell.tech   ║
║   https://dev.ravell.tech   ║     ║ https://api-dev.ravell.tech ║
║                             ║     ║                             ║
║  React 19 + Vite 7 SPA     ║     ║  Nginx → Gunicorn → Django  ║
║  Tailwind CSS v4            ║     ║  Django Ninja REST API      ║
║  React Router v7            ║     ║                             ║
╚═════════════════════════════╝     ╚══════════════╦══════════════╝
                                                   ║
                                   ┌───────────────┴───────────────┐
                                   ▼                               ▼
                          Supabase PostgreSQL            Supabase Storage
                          (Database & Indexing)          (S3-Compatible)
```

---

## 💻 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | React | 19.1 |
| **Build Tool** | Vite | 7.0 |
| **Language** | TypeScript | 5.8 |
| **Styling** | Tailwind CSS | 4.1 |
| **Icons** | Lucide React | 0.544 |
| **Routing** | React Router DOM | 7.7 |
| **HTTP Client** | Axios | 1.11 |
| **Animations** | Framer Motion | 12.23 |
| **SEO / Meta** | react-helmet-async | 2.0 |
| **Markdown** | react-markdown + remark-gfm | 10.1 / 4.0 |
| **Syntax Highlighting** | react-syntax-highlighter | 15.6 |
| **Date Formatting** | Day.js | 1.11 |
| **Loading States** | react-loading-skeleton | 3.5 |
| **Performance** | @vercel/speed-insights | 1.3 |

---

## 📂 Project Structure

```
Ravell_FrontEnd/
├── public/                        # Static assets (favicon, manifest, etc.)
├── src/
│   ├── assets/                    # Images, logos, and media assets
│   ├── components/                # Reusable UI components
│   │   ├── Header.tsx             # Main navigation header with theme toggle
│   │   ├── Sidebar.tsx            # Left sidebar with categories, tags, archives
│   │   ├── RightSidebar.tsx       # Right sidebar (table of contents / archives)
│   │   ├── Footer.tsx             # Site footer with social links
│   │   ├── Layout.tsx             # Holy Grail three-column layout wrapper
│   │   ├── ArticleCard.tsx        # Article card for listing pages
│   │   ├── ArticleCardHome.tsx    # Featured article card for homepage
│   │   ├── MarkdownRenderer.tsx   # Markdown-to-HTML renderer with syntax highlighting
│   │   ├── ImageModal.tsx         # Lightbox overlay for image zoom
│   │   ├── FurtherReading.tsx     # Related articles recommendation section
│   │   ├── Breadcrumbs.tsx        # Breadcrumb navigation component
│   │   ├── Pagination.tsx         # Paginated navigation controls
│   │   ├── TableOfContents.tsx    # Auto-generated heading-based table of contents
│   │   ├── ReadingProgressBar.tsx # Dynamic scroll-based reading progress indicator
│   │   ├── ScrollToTopButton.tsx  # Scroll-to-top floating action button
│   │   ├── SEO.tsx                # SEO head tag manager component
│   │   ├── SEOManager.tsx         # Open Graph & Twitter Card metadata manager
│   │   ├── ThemeToggle.tsx        # Dark/Light mode toggle switch
│   │   ├── CategoryItem.tsx       # Individual category display with hierarchy
│   │   ├── ArchiveMonthItem.tsx   # Archive timeline month item
│   │   ├── CopyButton.tsx         # Code block copy-to-clipboard button
│   │   ├── SkeletonCard.tsx       # Skeleton loading placeholder card
│   │   ├── PageTransition.tsx     # Page transition animation wrapper
│   │   └── UpdateNotification.tsx # Lightweight content polling via signature endpoint
│   ├── context/
│   │   └── GlobalContext.tsx       # Global state provider (categories, tags, etc.)
│   ├── hooks/
│   │   ├── useActiveHeading.ts    # Hook for tracking active heading in viewport
│   │   └── usePageTracking.ts     # Hook for page view analytics
│   ├── pages/
│   │   ├── HomePage.tsx           # Landing page with featured articles
│   │   ├── ArticleListPage.tsx    # Paginated article listing with filters
│   │   ├── ArticleDetailPage.tsx  # Full article reader with markdown rendering
│   │   ├── CategoriesPage.tsx     # Category listing page (hierarchical)
│   │   ├── TagsPage.tsx           # Tag cloud listing page
│   │   ├── ArchivesPage.tsx       # Chronological archives page
│   │   ├── AboutPage.tsx          # About page
│   │   └── NotFoundPage.tsx       # 404 error page with navigation fallbacks
│   ├── services/
│   │   └── apiClient.ts           # Axios API client with intelligent URL routing & content signature
│   ├── types/
│   │   └── types.ts               # TypeScript interfaces (Article, Category, Tag, etc.)
│   ├── App.tsx                    # Root application with routing configuration
│   ├── SidebarContext.tsx         # Sidebar toggle state context provider
│   ├── ThemeContext.tsx           # Theme (dark/light) persistence context
│   ├── main.tsx                   # Application entry point
│   └── index.css                  # Global Tailwind CSS imports and custom styles
├── .env.development               # Development environment variables (local)
├── vercel.json                    # Vercel deployment configuration (rewrites, headers, CSP)
├── vite.config.ts                 # Vite build configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
└── index.html                     # HTML entry point
```

---

## ✨ Key Features

### 🎨 UI/UX
- **Holy Grail Layout**: Three-column responsive grid with sticky left menu, clean reading viewport, and context-aware right sidebar (table of contents / archive timeline).
- **Smart Theme Engine**: Dark/Light mode with `localStorage` persistence and automatic `prefers-color-scheme` system detection.
- **Micro-animations**: Smooth fade-in, slide-in page transitions, and a dynamic reading progress indicator bar (powered by Framer Motion).
- **Image Lightboxes**: Click-to-zoom modal overlays for detailed diagrams and technical flowcharts.
- **Responsive Design**: Fully optimized layouts for desktop, tablet, and mobile viewports.

### 🔗 Navigation & Routing
- **Auto-Correction & Slug Validation**: Validates `tag_name` and `category_name` URL parameters directly against the API. Automatically corrects altered display names in the address bar.
- **404 Fallback**: Graceful "Content Unavailable" screen with navigation fallbacks (Go Back, Home, Browse Articles) when a slug does not exist.
- **Breadcrumbs**: Contextual breadcrumb navigation on every page.
- **Pagination**: Server-driven paginated article listing with `page` and `page_size` support.

### 📰 Content
- **Markdown Rendering**: Full GitHub-flavored markdown support with syntax-highlighted code blocks, tables, task lists, and auto-linked headings.
- **Table of Contents**: Auto-generated from article headings with viewport-aware active heading tracking.
- **Further Reading**: Random article recommendations (excluding current article) displayed at the end of each article.
- **Archive Timeline**: Chronological browsing by year and month.
- **Hierarchical Categories**: Nested parent-child category display mirroring backend structure.

### 🔍 SEO
- Unique `<title>` tags and meta descriptions per page via `react-helmet-async`.
- Open Graph and Twitter Card metadata for social sharing.
- Semantic HTML5 structure with proper heading hierarchy.
- RSS/Atom feed support via Vercel rewrites (proxied to backend feed endpoints).

### ⚡ Performance & Egress Optimization
- **Content Signature Polling**: `UpdateNotification` polls a single ~35 byte `/api/content/signature/` endpoint every 60 seconds instead of fetching 3 full API responses (~74 KB). Reduces Supabase egress by ~2,100x per poll cycle.
- **Visibility-Aware**: Polling pauses when the browser tab is hidden and resumes on tab focus.
- **Lazy Loading**: Code-split pages and components for optimal initial load.

---

## ⚙️ Environment Configuration

The frontend uses Vite's `import.meta.env` for environment variables. These are **compile-time** values, meaning they are embedded into the JavaScript bundle during the build process.

### Environment Variables

| Variable | Description | Example Value |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API (without `/api` suffix) | `https://api.ravell.tech` |

### Local Files

| File | Purpose | Used When |
|---|---|---|
| `.env.development` | Local development overrides | `npm run dev` |
| `.env.production` | Production build values | `npm run build` |
| `.env.local` | Local-only overrides (gitignored) | Any mode |

### Vercel Environment Variables

> ⚠️ **IMPORTANT**: Since Vite variables are build-time, the values set in **Vercel Dashboard → Settings → Environment Variables** take priority over local `.env` files during deployment.

| Environment | Branch | `VITE_API_BASE_URL` Value |
|---|---|---|
| **Production** | `main` | `https://api.ravell.tech` |
| **Preview / Development** | `development` | `https://api-dev.ravell.tech` |

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or pnpm

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rifandii/Ravell_FrontEnd.git
   cd Ravell_FrontEnd
   ```

2. **Switch to the desired branch**:
   ```bash
   # For production codebase
   git checkout main

   # For development codebase
   git checkout development
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure environment** (optional — `.env.development` already provided):
   Create `.env.local` if you need custom overrides:
   ```env
   VITE_API_BASE_URL=https://api.ravell.tech
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript check + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint on the codebase |

---

## 🌍 Deployment (Vercel)

The frontend is deployed on **Vercel** with automatic deployments triggered by GitHub pushes.

### Deployment Flow
```
Git Push → GitHub → Vercel Build Hook → Vite Build → CDN Deploy
```

| Branch | Vercel Environment | Domain |
|---|---|---|
| `main` | Production | `https://ravell.tech` |
| `development` | Preview | `https://dev.ravell.tech` |

### Vercel Configuration (`vercel.json`)

The `vercel.json` file configures:

1. **Rewrites**:
   - `/feed.xml`, `/rss.xml` → proxied to `https://api.ravell.tech/feed/rss/`
   - `/atom.xml` → proxied to `https://api.ravell.tech/feed/atom/`
   - `/(*)` → `index.html` (SPA client-side routing fallback)

2. **Security Headers** (applied to all routes):
   - `X-Frame-Options: DENY`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `Cross-Origin-Opener-Policy: same-origin`
   - `Cross-Origin-Embedder-Policy: credentialless`
   - `Cross-Origin-Resource-Policy: same-origin`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy` (camera, microphone, geolocation, payment disabled)

3. **Content Security Policy (CSP)**:
   - `connect-src`: Allows `api.ravell.tech`, `api-dev.ravell.tech`, Supabase, Google Analytics, Cloudflare
   - `script-src`: Allows Google Tag Manager, Cloudflare Insights
   - `img-src`: Allows Supabase Storage, Google Analytics
   - `font-src`: Allows Google Fonts

4. **Service Worker Cache Control**:
   - `/sw.js` served with `no-cache, no-store, must-revalidate`

### Vercel Authentication (Deployment Protection)
The `development` branch deployment (`dev.ravell.tech`) is protected by **Vercel Authentication**. Only users logged into the associated Vercel account can access the preview deployment. This is intentional to restrict development access.

---

## 🛠️ Dual-Environment Workflow

| Parameter | Production (Main) | Development (Dev) |
|---|---|---|
| **Git Branch** | `main` | `development` |
| **Frontend URL** | `https://ravell.tech` | `https://dev.ravell.tech` |
| **Backend API URL** | `https://api.ravell.tech` | `https://api-dev.ravell.tech` |
| **Backend Admin** | `https://api.ravell.tech/ravell-manage` | `https://api-dev.ravell.tech/ravell-manage` |
| **Access Control** | Public | Vercel Authentication |
| **Database** | Supabase (Shared) | Supabase (Shared) |

> ⚠️ **Shared Database**: Both environments share the same Supabase PostgreSQL database. Articles, categories, tags, and media uploaded via the development admin panel will immediately reflect on the production website. This ensures content consistency across environments.

### Git Branching Workflow

1. All new features, style adjustments, or bug fixes **must be committed to the `development` branch first**.
2. Verify changes on the development frontend (`https://dev.ravell.tech`) and backend (`https://api-dev.ravell.tech`).
3. Only with explicit approval, merge `development` into `main` via Pull Request.
4. Vercel automatically redeploys both environments on push.

---

## 🛡️ Cloudflare & Security

Cloudflare acts as the edge security proxy for all `ravell.tech` domains.

### DNS Records (Frontend)

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `ravell.tech` | `cname.vercel-dns.com` | Proxied ☁️ |
| CNAME | `dev.ravell.tech` | `cname.vercel-dns.com` | Proxied ☁️ |

### Security Configuration

| Setting | Value | Purpose |
|---|---|---|
| SSL/TLS Encryption | Full (Strict) | End-to-end TLS encryption |
| Always Use HTTPS | ON | Force HTTPS redirect |
| Minimum TLS Version | TLS 1.2 | Block outdated protocols |
| Brotli Compression | ON | Enhanced compression |
| Early Hints | ON | Faster resource loading |
| Email Obfuscation | ON | Prevent email scraping |
| Hotlink Protection | ON | Block external media embedding |

### Custom WAF Rules

| Rule Name | Action | Purpose |
|---|---|---|
| Protect API Origin | Block | Block direct public API access without valid Origin/Referer |
| Block API Docs Public | Block | Block public access to `/api/docs` endpoint |
| Allow CORS Preflight & Dev | Skip | Allow `OPTIONS` requests and trusted origins (`localhost`, `dev.ravell.tech`, `*.vercel.app`) |

---

## 📦 Related Repositories

| Repository | Description | URL |
|---|---|---|
| **Ravell_BackEnd** | Django + Django Ninja REST API backend | [github.com/rifandii/Ravell_BackEnd](https://github.com/rifandii/Ravell_BackEnd) |

---

## 📊 API Endpoints Consumed

The frontend consumes the following backend API endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/articles/` | GET | Paginated article list with filters (category, tag, search, year, month) |
| `/api/articles/{slug}/` | GET | Single article detail by slug |
| `/api/articles/latest/` | GET | Latest 5 published articles |
| `/api/articles/random_articles/` | GET | 3 random article recommendations |
| `/api/categories/` | GET | Paginated category list (hierarchical) |
| `/api/categories/{slug}/` | GET | Single category detail by slug |
| `/api/tags/` | GET | Paginated tag list |
| `/api/tags/{slug}/` | GET | Single tag detail by slug |
| `/api/archives/` | GET | Article archives grouped by year and month |
| `/api/images/` | GET | Paginated image list |
| `/api/content/signature/` | GET | Lightweight content change signature (~35 bytes) |

---

*📁 README last updated: June 24, 2026*