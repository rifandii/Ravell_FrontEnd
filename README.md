# Ravell Networks Frontend

Next.js App Router frontend for the Ravell Networks technical knowledge base.
It renders public articles, taxonomy, search and filtering UI, syndication
routes, and the server-side revalidation route used by the backend development
cutover.

Last reviewed: 2026-07-14

## Operational Status

| Area | Production | Development |
| --- | --- | --- |
| Branch / deployment target | `main` / Vercel Production | `development` / Vercel Preview alias |
| Public URL | `https://ravell.tech` | `https://dev.ravell.tech` |
| Backend base URL | `https://api.ravell.tech` | `https://api-dev.ravell.tech` |
| Supported runtime | Next.js App Router | Next.js App Router |
| UI/UX baseline | Approved and change-controlled | Same approved baseline |
| WEB-02 frontend route | Present but production backend promotion is deferred | Signed revalidation route is runtime-validated |
| WEB-03 syndication | Dynamic sitemap and feeds are live | Dynamic sitemap and feeds are live |

FE-01 is complete: the supported deployment and rollback path is Next.js only.
Legacy Vite-era files may still exist in historical or unpromoted local
worktrees, but they are not a supported dev server, build, preview, deployment,
or rollback path.

The approved UI/UX baseline is
[`docs/ui-ux-baseline.md`](docs/ui-ux-baseline.md). Do not change layout,
navigation, article interaction, error states, or visual behavior without
explicit owner approval.

## Architecture

```text
Browser
  -> Cloudflare
  -> Vercel CDN and Next.js App Router
  -> public Ravell backend API over HTTPS
  -> Cloudflare -> Nginx -> Gunicorn -> Django
```

The frontend does not reach a raw origin IP. It uses the environment-specific
public API hostname. Admin access belongs to the backend and is protected by
Cloudflare Access; public content routes remain public.

## Runtime Behavior

- Article, category, tag, archive, search, pagination, image modal, theme, and
  empty/error states run through the App Router UI.
- API failures remain failures: an outage is not converted to an empty result,
  invalid filter, or article-not-found state.
- `X-Request-ID` from backend responses is available for cross-service
  correlation where the response exposes it.
- The PWA service worker follows the documented conservative cache policy and
  does not turn API or document failures into cached content.
- The frontend exposes dynamic public syndication routes and an internal signed
  revalidation endpoint.

## Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage |
| `/articles` | Listing, search, filters, and pagination |
| `/articles/[slug]` | Article detail and metadata |
| `/categories`, `/tags`, `/archives` | Taxonomy and archive views |
| `/sitemap.xml` | Dynamic sitemap |
| `/feed.xml` | RSS-compatible feed route |
| `/rss.xml` | RSS route |
| `/atom.xml` | Atom route |
| `/api/internal/revalidate` | Internal signed cache revalidation route; not public API |

WEB-03 validated production sitemap and feed freshness without content
mutation. The frontend routes obtain public syndication data from the backend
instead of relying on a static `public/sitemap.xml` artifact.

## Development And Verification

Prerequisites:

- Node.js 20+; use the repository `packageManager` through Corepack
- pnpm is the authoritative package manager
- A local environment override only when a non-default API base URL is needed

```bash
git clone git@github.com:rifandii/Ravell_FrontEnd.git
cd Ravell_FrontEnd
git checkout development
corepack enable
corepack pnpm install --frozen-lockfile
corepack pnpm run dev
```

Core validation:

```bash
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run api:types:check
corepack pnpm run build
corepack pnpm run test:e2e:smoke
```

For a read-only development smoke test, configure the test runner with the
development hostnames. Production smoke tests require a separately approved
read-only production validation window.

Do not use Vite commands as a fallback. Do not use `npm install` or create a
second lockfile; keep `pnpm-lock.yaml` authoritative.

## Environment Variables

Do not commit `.env*` files or `.vercel/`. Values stay in the approved local or
Vercel environment configuration.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Public build-time value | Public backend base URL without `/api` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional public build-time value | GA4 page-view tracking |
| `RAVELL_REVALIDATION_SECRET` | Server-only Vercel value | Verifies backend-to-frontend revalidation requests |

`RAVELL_REVALIDATION_SECRET` must never use a `NEXT_PUBLIC_` prefix and must
never be emitted to browser code, source, logs, screenshots, or documentation.
It is installed only on the Vercel environment that serves the intended alias.

## Content Revalidation

Development proved durable backend outbox delivery to
`/api/internal/revalidate`, including lifecycle update/restore, timer retry,
and no-rebuild behavior in `revalidation` mode.

Production backend WEB-02 promotion is deferred. Therefore, the existence of
the frontend route does not authorize enabling a production backend delivery
mode or adding/reusing a production secret. Treat production content-refresh
behavior as the current approved production release behavior until a dedicated
promotion is approved.

## Vercel Release Process

Vercel is connected to GitHub:

- `development` produces the deployment aliased to `https://dev.ravell.tech`.
- `main` produces the deployment aliased to `https://ravell.tech`.

Use the exact reviewed commit and its resulting Vercel deployment as a release
artifact. A production promotion requires owner approval after preview,
typecheck, lint, API contract, build, browser smoke, UI/UX invariant, and any
applicable backend compatibility checks are accepted.

Rollback is a reviewed Vercel promotion to the previous known-good production
deployment, followed by a source revert if source history must change. Do not
force-push, rewrite history, or use a local legacy runtime as rollback.

## External Monitoring

The approved UptimeRobot Free monitors run every five minutes:

- Ravell Production Frontend
- Ravell Development Frontend
- Ravell Development Backend Health
- Ravell Development Backend Readiness
- Ravell Production Backend Feed

These are HEAD availability checks under the provider's free-tier 2xx/3xx
policy. Initial preflight returned direct HTTP `200` for the selected targets.
They are not proof of response-body correctness, browser rendering, content
freshness, or exact HTTP-status enforcement.

## API Contract Workflow

The backend OpenAPI artifact is the transport contract source of truth. The
generated frontend artifacts are under `src/types/generated/`.

```bash
corepack pnpm run api:types
corepack pnpm run api:types:check
```

Generated transport contracts remain separated from frontend view models. Keep
changes to request/error semantics explicit and cover them with the relevant
browser and API-contract checks.

## Security Notes

- Do not add client-side API keys, backend secrets, or revalidation secrets.
- Do not bypass Cloudflare, use raw origin addresses, or add SDK/RUM/browser
  agents without a reviewed change.
- Keep public frontend traffic on HTTPS. Cloudflare and Vercel own edge
  transport behavior; application code must not implement alternate origin
  routing.
- Production admin protection is a backend Cloudflare Access concern. The
  frontend must not embed admin or Access credentials.

## Related Repository

| Repository | Role |
| --- | --- |
| `rifandii/Ravell_BackEnd` | Django and Django Ninja API, admin, content lifecycle, and operations |
