# Analytics Ownership

Last reviewed: 2026-07-13

## Ownership Model

The active Next.js App Router runtime owns Google Analytics 4 page-view tracking directly.

GTM is not the current owner for GA4 page views. Do not configure a GTM container to send the same GA4 page-view event while the direct Next.js implementation is enabled.

## Active Implementation

| Concern | Owner |
| --- | --- |
| GA4 script loading | `src/app/layout.tsx` |
| GA4 measurement ID source | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Automatic GA4 config page view | Disabled with `send_page_view: false` |
| App Router page-view events | `src/components/AnalyticsPageView.tsx` |

The runtime emits one manual `page_view` event for:

- initial page load after hydration;
- client-side route navigation;
- browser back/forward navigation.

Each event includes `page_path`, `page_location`, and `page_title`. Query strings are included in `page_path`.

## Environment Requirements

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel for every environment where analytics should run:

| Environment | Required variable |
| --- | --- |
| Production | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |
| Preview / development | `NEXT_PUBLIC_GA_MEASUREMENT_ID` |

As of the ANA-01 audit on 2026-06-28, `vercel env ls` showed API base URL variables only. The analytics variable still requires owner-side configuration before dashboard verification can be completed.

Do not hard-code analytics IDs in source files, README files, MOP evidence, screenshots, or commit messages.

## Duplicate Prevention

The active implementation prevents default GA4 page-view duplication by calling:

```text
gtag('config', measurementId, { send_page_view: false })
```

Manual page-view events are emitted by the App Router tracker. A GTM workspace must not also send GA4 page views for the same property unless the direct Next.js tracker is disabled first.

The previous Vite analytics path was removed during ANA-01. FE-01 subsequently
retired the complete Vite runtime, so there is no second frontend analytics owner
in the active source tree.

## Validation Checklist

Local automated validation:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TESTANA01 corepack pnpm run build
E2E_GA_MEASUREMENT_ID=G-TESTANA01 corepack pnpm run test:e2e -- tests/e2e/analytics.spec.ts
```

Runtime dashboard validation after Vercel env configuration and redeploy:

- open `https://dev.ravell.tech`;
- confirm one `gtag/js` script is present and no `gtm.js` script is present;
- open GA DebugView for the configured property;
- load `/`, navigate to `/articles`, then use browser Back;
- confirm exactly one expected `page_view` per navigation step;
- confirm no duplicate page views from a GTM GA4 tag.

## Operational Notes

Changing the measurement ID requires a Vercel environment update and redeploy. If GTM becomes the desired owner later, remove the direct Next.js page-view tracker first, then document the GTM container ownership and DebugView evidence in this file.
