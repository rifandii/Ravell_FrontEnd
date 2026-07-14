# Ravell Networks Frontend

Next.js App Router frontend for the Ravell Networks technical knowledge base.
It renders the public site, search and taxonomy experiences, article detail,
dynamic syndication routes, and the backend-facing revalidation route.

Last reviewed: 2026-07-15

## What This Application Provides

- Homepage, article listing, search, filters, pagination, and article detail.
- Category, tag, and archive pages.
- Image modal, theme support, accessible navigation, and clear empty, invalid
  filter, not-found, and outage states.
- Dynamic `/sitemap.xml`, `/feed.xml`, `/rss.xml`, and `/atom.xml` routes.
- Signed internal `/api/internal/revalidate` endpoint for approved backend
  content-refresh flows.
- Next.js-only development, build, preview, deployment, and rollback path.

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
| Backend API | `https://api.ravell.tech` | `https://api-dev.ravell.tech` |
| Vercel target | Production | Preview alias |
| Supported runtime | Next.js App Router | Next.js App Router |
| Content revalidation | Separately promoted backend scope | Validated signed refresh flow |

Development and production are independently deployed. A preview is the gate
for a production promotion, not a substitute for it.

## Architecture

```text
Browser
  -> Cloudflare
  -> Vercel CDN and Next.js App Router
  -> Ravell public backend API over HTTPS
```

The frontend uses public API hostnames and never connects to a raw backend
origin. API failures remain failures: they are not silently converted into an
empty list, invalid filter, or missing-article result.

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/articles` | Listing, search, filters, and pagination |
| `/articles/[slug]` | Article detail and metadata |
| `/categories`, `/tags`, `/archives` | Taxonomy and archive views |
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

Before a release, run the relevant project gates:

```bash
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run api:types:check
corepack pnpm run build
corepack pnpm run test:e2e:smoke
```

## Release Workflow

1. Validate the scoped change locally and in CI.
2. Deploy or inspect the exact Vercel preview for the candidate SHA.
3. Check public routes, error semantics, and dynamic sitemap/feed behavior.
4. Promote only the reviewed artifact to production after owner approval.
5. Roll back by promoting the prior known-good Vercel deployment; do not rebuild
   a different artifact during an incident.

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
