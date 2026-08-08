# Ravell Frontend Repository Guidance

## Repository Purpose

This repository contains the Ravell public frontend application.

The active frontend runtime is:

- Next.js App Router;
- TypeScript;
- pnpm;
- Vercel.

The production site is deployed through the established Vercel production workflow.

Treat source promotion and Vercel runtime promotion as related but distinct evidence states.

## Active Runtime

Next.js App Router is the only active source-controlled frontend runtime.

Do not restore the retired Vite application runtime.

The following legacy runtime paths must remain absent unless an explicit architecture decision reverses FE-01:

```text
src/App.tsx
src/main.tsx
src/vite-pages/
vite.config.ts
index.html
package-lock.json
```

Do not restore:

- Vite runtime scripts;
- Vite-only dependencies;
- React Router runtime ownership;
- duplicate npm lockfile ownership.

Historical rollback evidence belongs in Git and Vercel deployment history.

It does not require retaining a duplicate runtime in the active source tree.

## Package Management

`pnpm` is authoritative.

Use:

```text
corepack pnpm
```

Prefer:

```text
corepack pnpm install --frozen-lockfile
```

for deterministic dependency validation.

Do not introduce or restore `package-lock.json`.

Do not use npm to rewrite dependency state.

Before changing dependencies:

- identify why the dependency is required;
- inspect whether an existing dependency already provides the capability;
- update `package.json` and `pnpm-lock.yaml` coherently;
- validate the resulting build.

Do not add a runtime dependency merely to simplify a small local implementation.

## Branch Model

Normal development flow:

```text
local development
→ origin/development
→ validation
→ pull request development to main
→ Vercel production promotion
→ production validation
→ main fast-forward sync back to development
```

Rules:

- normal work starts from `development`;
- normal pushes go to `development`;
- do not edit `main` directly;
- promote through a pull request;
- production promotion requires the appropriate production approval boundary;
- after successful production validation, synchronize main back to development with fast-forward only.

Do not use:

- shared-branch rebase;
- reset as published-history rollback;
- force push;
- amend after publication;
- squash solely to hide lineage.

Published source rollback should use reviewed `git revert`.

Runtime rollback should use the established Vercel rollback mechanism when the failure is production-artifact related.

## Git Safety

Before modifying the repository:

1. run `git status --short`;
2. confirm the active branch;
3. fetch remote references when branch state matters;
4. identify exact files in scope;
5. preserve unrelated dirty state.

Do not use:

```text
git add .
git add -A
```

Stage exact paths only.

Before every commit:

```text
git status --short
git diff --cached --name-status
git diff --cached --stat
```

Do not stage unrelated files.

`AGENTS.md` itself must not be included in an unrelated feature, bugfix, or maintenance commit.

## UI/UX Baseline

The current accepted production UI/UX is an invariant unless the active task explicitly requests a visual change.

Preserve current behavior for:

- homepage;
- header and navigation;
- expanding search;
- article cards;
- article list;
- filters;
- pagination;
- article detail;
- clickable tags;
- image modal;
- table of contents;
- categories;
- tags;
- archives;
- dark mode;
- responsiveness;
- skeleton state;
- empty search state;
- invalid-filter state;
- backend-unavailable state;
- not-found behavior.

Do not classify pagination absence as a regression when the current result count does not require pagination.

When a task does not request visual change, required classification is:

```text
UI_UX_VISUAL_CHANGE = no
```

Do not change spacing, animation, typography, colors, responsive behavior, or component structure incidentally while solving unrelated logic.

If a logic change requires a visual behavior change, stop and identify the UI/UX decision before proceeding.

## Active Next Components

The active App Router component tree is authoritative.

When relevant, inspect current Next-specific components such as:

```text
HeaderNext
ArticleCardNext
PaginationNext
RightSidebarNext
```

Do not restore removed legacy equivalents merely because they exist in Git history.

Before deleting or replacing an active component:

- inspect current imports;
- inspect current route usage;
- inspect UI/UX baseline documentation;
- inspect relevant Playwright coverage.

## Backend Data Access

The frontend consumes the Ravell backend API.

Do not assume local `.env.local` values represent development or production runtime configuration.

Local environment files may intentionally point to a local backend.

Do not read or print secret-bearing environment values.

When validating against development or production API behavior, use an explicit environment-aligned override or the established runtime environment.

Do not commit local environment overrides.

When changing API response handling:

- inspect the generated API contract;
- inspect the frontend view model;
- inspect affected server and client components;
- preserve explicit backend-unavailable semantics.

Do not silently turn backend failures into empty successful content states.

## API Contract

Generated API contract state must remain coherent with the backend contract.

Use the established validation:

```text
corepack pnpm run api:types:check
```

Do not manually edit generated API type output to silence a mismatch.

When the API contract changes:

1. verify the backend source of truth;
2. regenerate using the established script;
3. review generated differences;
4. update frontend mapping only when required.

Do not invent response fields.

## Caching And Revalidation

Next.js caching, ISR, syndication generation, and internal revalidation are architecture-sensitive.

Before modifying:

```text
src/lib/cachePolicy.ts
src/app/api/internal/revalidate/route.ts
src/lib/revalidationAuth.ts
src/lib/backendFetch.ts
src/lib/backendFailure.ts
```

inspect:

- current cache policy;
- current route authentication;
- current failure behavior;
- existing tests;
- backend integration expectations.

Distinguish:

```text
route source exists
production secret configured
backend delivery configured
backend timer active
production revalidation active
```

These are separate states.

Do not claim WEB-02 production activation merely because the frontend internal revalidation route exists.

Do not activate production revalidation by modifying Vercel environment values or backend delivery configuration without explicit approval.

## Public Syndication

Preserve public WEB-03 behavior for:

```text
/sitemap.xml
/feed.xml
/rss.xml
/atom.xml
```

Required behavior includes:

- canonical route availability;
- HTTP success when dependencies are healthy;
- correct media type;
- current Next.js route ownership.

Do not restore static legacy sitemap ownership or Vite-era rewrites merely because they exist in repository history.

When changing public syndication:

- inspect `src/lib/publicSyndication.ts`;
- inspect route handlers;
- inspect cache behavior;
- run relevant validation.

A successful HTML response on a feed route is not equivalent to a healthy feed.

Validate media type.

## Service Worker And Cache Behavior

The active service-worker behavior must remain compatible with the Next.js runtime.

Do not introduce a second registration path.

Do not restore Vite service-worker behavior.

Do not cache backend API responses through the browser service worker unless an explicit cache architecture decision approves it.

Preserve ownership boundaries:

```text
Next.js ISR / fetch cache
=
application content freshness

service worker
=
approved browser asset caching behavior
```

Do not mix these layers casually.

## Internal Routes

Internal routes are not automatically public product APIs.

For routes such as internal revalidation:

- preserve authentication checks;
- preserve failure sanitization;
- do not expose secret values;
- do not weaken the route merely to simplify a test;
- test unauthorized behavior;
- test malformed requests;
- test valid authenticated behavior through sanitized test credentials.

Never print production revalidation secrets.

## Autonomous Operations Authorization

```text
AUTHORIZED_AGENT = CLAUDE
ROUTINE_OWNER_APPROVAL = NOT_REQUIRED
MANUAL_OWNER_INPUT = NOT_REQUIRED
AUTONOMOUS_TROUBLESHOOTING = ENABLED
PRODUCTION_SCOPE = INCLUDED
```

Granted by the owner on 2026-07-26 for the interactive Claude session. Claude may
inspect, fix, commit, push, open and merge pull requests, rerun CI, promote to
`main`, deploy, and roll back without per-step approval, production included.

This authorization does **not** extend to the `@claude` GitHub Action channel.
That agent is triggered by a comment, runs in CI with no owner present, and keeps
every restriction in `Automated Agent Boundary` below — including the protected
paths and the rule that it never merges its own work. The two channels have
different supervision, so they keep different authority. Widening the Action
channel is a separate owner decision.

The exceptions in the root `AGENTS.md` apply in full: Cloudflare Access
applications and policies, raw secret values, force push, history rewrite,
irreversible account-wide actions, and `Ravell_Knowledge`.

## Production Boundary

A merge to `main` may trigger a Vercel production deployment.

Therefore:

```text
development → main
```

remains a production-sensitive action. It is authorized, but it is never
incidental: state that a change promotes production before promoting it, and
report it as a production event separately from the source change.

Vercel production environment values, production aliases, production project
configuration, deployment protection, and production domains may be changed when
the active workstream requires it. The set of hosting projects is fixed — never
create a new one, and deploy only through the established Git integration rather
than a provider CLI or an ad-hoc upload.

After promotion, do not validate an arbitrary READY deployment.

Attribute production to the exact resulting main SHA.

Required evidence model:

```text
PR_HEAD_SHA
RESULTING_MAIN_SHA
RESULTING_MAIN_TREE
VERCEL_DEPLOYMENT_ID
DEPLOYMENT_SOURCE_SHA
PRODUCTION_ALIAS
```

When the main merge creates a new merge commit, candidate SHA and main SHA may differ.

Compare tree identity when required.

Do not incorrectly require candidate commit SHA equality when the merge method creates a merge commit.

## Production Validation

After an approved frontend production promotion, use bounded production validation.

Expected areas include the relevant subset of:

- `/`;
- `/articles`;
- `/categories`;
- `/tags`;
- `/archives`;
- one known article;
- empty search;
- invalid filter;
- missing article;
- header/search;
- article cards;
- pagination disposition;
- image modal;
- dark mode;
- sitemap;
- feed;
- RSS;
- Atom.

Required classifications for a non-visual maintenance promotion:

```text
UI_UX_VISUAL_CHANGE
ACTIVE_NEXT_BEHAVIOR_REGRESSION
WEB03_REGRESSION
PRODUCTION_CONTENT_MUTATED
WEB02_BACKEND_PRODUCTION_ACTIVATED
```

Do not mutate production content merely to test the frontend.

## Rollback

For a material production artifact regression:

1. identify the current failing production deployment;
2. identify the previous validated production deployment;
3. promote the previous known-good Vercel deployment when runtime rollback is approved;
4. validate production recovery;
5. stop and report the failure.

Do not reset main.

Source rollback should use reviewed `git revert` of the relevant merge or source commit.

Do not create an emergency patch inside the rollback step unless the task explicitly authorizes a new bugfix.

## Security And Secrets

Never read, print, copy, or commit:

- `.env` values;
- `.env.local` values;
- tokens;
- API keys;
- session cookies;
- private keys;
- authentication secrets;
- production revalidation secret values.

The existence and purpose of a configuration value may be documented without exposing the value.

Do not log authorization headers.

Do not include secret-bearing values in Playwright output, screenshots, or reports.

## Validation Baseline

For material frontend source changes, use the applicable subset of:

```text
corepack pnpm install --frozen-lockfile
corepack pnpm run typecheck
corepack pnpm run lint
corepack pnpm run api:types:check
corepack pnpm run build
corepack pnpm run test:e2e:smoke
git diff --check
```

Run focused Playwright tests for the changed capability when available.

Examples:

```text
backend outage handling
revalidation route
analytics behavior
public syndication
```

Do not run the retired Vite build.

Do not repeat expensive validation without a causal reason.

Classify findings as:

- BLOCKER;
- MATERIAL;
- DEFER.

### BLOCKER

The candidate fails a required validation or demonstrably regresses accepted behavior.

### MATERIAL

The implementation requires an unresolved architecture, runtime, or production decision.

### DEFER

The finding is non-blocking, accepted, cosmetic, administrative, or outside the bounded task.

Do not create remediation loops for DEFER findings.

Known administrative metadata that does not affect the actual Next.js production artifact must not automatically reopen FE-01.

## Documentation

Repository documentation should describe:

- active frontend architecture;
- source-controlled behavior;
- development workflow;
- validation;
- deployment expectations;
- rollback.

Broader reusable architecture principles belong to a canonical knowledge plane maintained outside this repository.

Do not duplicate full reusable architecture principles across README, project notes, and multiple frontend documents.

When broader knowledge should be retained, propose it as a separately scoped update to that knowledge plane rather than expanding this document.

Do not modify anything outside this repository incidentally during frontend implementation.

## Automated Agent Boundary

An automated coding agent may be invoked in this repository through an explicit `@claude` mention on an issue or pull request comment. These rules bound what any automated contributor may do.

They are unchanged by `Autonomous Operations Authorization` above, which applies only to the interactive Claude session where the owner is present.

Trigger:

- only the repository owner may trigger an agent run;
- a mention from any other account is ignored before the run starts;
- there is no scheduled, push, or otherwise automatic trigger.

Branching and promotion:

- agent work happens on a short-lived branch, never directly on a long-lived branch;
- every change reaches a long-lived branch through a pull request;
- direct push to `main` is prohibited;
- merging a pull request is reserved to the owner;
- an agent must never merge its own work.

Protected paths:

- `.github/workflows/**`;
- `.github/actions/**`;
- `AGENTS.md`;
- `CLAUDE.md`.

An agent may not edit, write, or delete a protected path. The denial is enforced by workflow configuration and fails closed. Changing a protected path requires explicit owner instruction outside the agent channel.

Production:

- production actions are reserved to the owner;
- an agent must never trigger, approve, or configure a production deployment;
- a merge to `main` may promote to production, which is why merge authority and production authority are the same authority;
- the set of hosting projects is fixed; an agent must never create a new one;
- deploy only through the established Git integration on a project that already exists, never through a provider CLI or an ad-hoc upload.

The last two rules exist because an ad-hoc deploy creates a hosting project with no Git linkage, and therefore no pull request, no continuous integration, no review, and no way to patch it afterwards. Every control described in this document depends on changes arriving through Git. A deploy that bypasses Git bypasses all of them at once. If a task appears to require a new hosting project, stop and ask.

Validation authority:

- an agent does not run lint, typecheck, tests, or builds in its own session;
- continuous integration is the verification authority;
- an agent may read a failing check and correct its own branch;
- an agent must never modify workflow or test configuration to make a failing check pass.

## Task Operating Model

Perform one bounded outcome at a time.

Before editing:

1. inspect current state;
2. identify affected routes and components;
3. identify UI/UX impact;
4. identify cache or revalidation impact;
5. identify required validation;
6. identify whether main promotion would cause production deployment.

For analysis requests:

- inspect;
- report;
- do not modify files unless explicitly requested.

For implementation requests:

- edit only required paths;
- preserve unrelated behavior;
- validate causal behavior;
- report exact files changed.

Do not reopen completed Ravell implementation workstreams without direct regression evidence.

New work should be classified as:

- INCIDENT;
- CHANGE REQUEST;
- FEATURE;
- BUGFIX;
- MAINTENANCE;
- RESIDUAL-RISK REMEDIATION.

## Code Discovery

Contributors may use local code indexing or search tooling of their choice.

Rules:

- any index, cache, or generated map such tooling produces is a local artifact;
- do not commit generated index output;
- do not add assistant hooks or local tooling configuration to this repository as a side effect of using it.

