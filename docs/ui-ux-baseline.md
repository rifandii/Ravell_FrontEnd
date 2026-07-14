# Ravell Frontend UI-UX Baseline

Last updated: 2026-07-13
Baseline commit: `defa70e`
Production deployment: `https://ravell.tech`
Development deployment: `https://dev.ravell.tech`

This document is the preservation note for the UI-UX work already approved and deployed. Do not change, remove, or redesign the behaviors below unless there is explicit owner approval.

## Guardrail

- Treat this document as the UI-UX contract for article listing, article detail, search, pagination, image preview, and article navigation polish.
- Any grand implementation branch must preserve these behaviors or document an approved replacement before merge.
- If a merge, refactor, or framework migration changes these behaviors unexpectedly, restore them from the implementation notes below.
- Backend logic, auth, database schema, infrastructure, and secrets are outside the scope of this UI-UX baseline.

## Implemented UI-UX Scope

### Article Listing

- `/articles` uses a clean documentation-style listing without thumbnail images.
- Article cards keep metadata, title, summary, tag pills, hover elevation, focus ring, and readable spacing.
- Loading skeletons on `/articles` match the no-thumbnail card layout to avoid layout jump.
- Pagination and filter states must remain visually stable and accessible.
- Tag/category/search filtered states must continue to show the correct contextual heading.

Key files:

- `src/app/articles/ArticleListClient.tsx`
- `src/components/next/ArticleCardNext.tsx`
- `src/components/SkeletonCard.tsx`

### Article Detail Tags

- Tags shown above an article title are clickable.
- Clicking a tag navigates to `/articles?tags__slug=<slug>&tag_name=<name>`.
- Tag pills keep hover/focus affordance and keyboard-visible focus states.

Key files:

- `src/app/articles/[slug]/page.tsx`

### Article Images

- Images inside article content and featured article images can be clicked to open a modal preview.
- The modal must render through a body-level portal so it is not affected by parent transforms or animated wrappers.
- Modal image must be visible inside the viewport, preserve aspect ratio, and use `object-contain`.
- Modal close behaviors:
  - click backdrop
  - close button
  - Escape key
- Body scroll is locked while the modal is open.

Key files:

- `src/components/ImageModal.tsx`
- `src/app/articles/[slug]/ArticleDetailClient.tsx`
- `src/components/MarkdownRenderer.tsx`

### Search UI Motion

- Desktop search box uses Framer Motion for hover/focus lift and focus shadow.
- Search icon and shortcut chip animate on focus.
- Mobile search button has hover/tap motion.
- Search interactions must remain functional with `Ctrl/Cmd + K`.

Key files:

- `src/components/next/HeaderNext.tsx`

### Table Of Contents

- Right sidebar "On This Page" labels must not include the heading anchor hash (`#`).
- Heading anchors can remain in article content for hover link behavior, but the TOC extraction must remove anchor-only text before storing sidebar labels.
- TOC buttons still scroll to the correct heading IDs.

Key files:

- `src/app/articles/[slug]/ArticleDetailClient.tsx`
- `src/components/next/RightSidebarNext.tsx`

### Overall Visual Direction

- Keep the documentation/knowledge-base feel: dense, readable, calm, and work-focused.
- Avoid reverting article pages to marketing-style hero layouts or large decorative cards.
- Maintain strong dark/light mode contrast.
- Keep cards and controls stable on mobile and desktop; avoid text overlap and layout shifts.
- Prefer subtle motion for state changes, not heavy decorative animation.

## Verification Checklist

Run these before claiming a UI-UX merge is safe:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
git diff --check
```

Manual/browser checks:

- `/articles`
  - article cards do not show thumbnails
  - loading skeletons do not reserve thumbnail space
  - pagination and filters remain usable
- `/articles/register-ftd-with-fmc`
  - article image click opens a visible modal
  - modal image is inside the viewport
  - TOC labels do not include `#`
  - article tags are clickable and route back to filtered article list
- Header search
  - desktop search animates on hover/focus
  - mobile search button animates on tap
  - `Ctrl/Cmd + K` focuses search

Known good browser smoke assertions:

```json
{
  "articleListCardImages": 0,
  "searchTransformChanged": true,
  "articleTagLinksPresent": true,
  "imageModalInViewport": true,
  "tocLabelsWithHash": []
}
```

## Grand Implementation Merge Strategy

Use this process to avoid clashes with the grand implementation branch:

1. Keep these UI-UX commits as a small preservation patch series:
   - `ce8ed4c` - UI motion and pagination work
   - `5d64eca` - article media and tag interactions
   - `dec82e0` - article image modal positioning
   - `defa70e` - remove hash anchors from article TOC labels
2. Rebase or merge the grand implementation branch on top of `development` after `defa70e`.
3. If the grand implementation already edits the same files, resolve conflicts by preserving the behavior listed in this document, not by blindly choosing either side.
4. Run the verification checklist after conflict resolution.
5. Deploy first to `dev.ravell.tech`.
6. Only promote/deploy to production after:
   - browser smoke checks pass
   - the owner confirms the UI-UX baseline is still intact
   - rollback target is known

## Conflict Hotspots

Expect conflicts or behavioral regressions if the grand implementation touches:

- `src/components/ImageModal.tsx`
- `src/components/MarkdownRenderer.tsx`
- `src/app/articles/[slug]/ArticleDetailClient.tsx`
- `src/app/articles/[slug]/page.tsx`
- `src/components/next/HeaderNext.tsx`
- `src/components/next/ArticleCardNext.tsx`
- `src/components/SkeletonCard.tsx`
- `src/app/articles/ArticleListClient.tsx`
- `src/components/next/RightSidebarNext.tsx`

## Restore Notes

If a future branch accidentally reverts this UI-UX work:

1. Compare the branch against `defa70e`.
2. Restore the affected files from the commit range listed in the merge strategy.
3. Re-run the verification checklist.
4. Verify `dev.ravell.tech` before production.

Example review commands:

```powershell
git diff defa70e -- src/components/ImageModal.tsx
git diff defa70e -- "src/app/articles/[slug]/ArticleDetailClient.tsx"
git diff defa70e -- src/components/next/HeaderNext.tsx
git diff defa70e -- src/app/articles/ArticleListClient.tsx
```

Rollback production if needed:

```powershell
npx vercel@latest rollback <previous-production-deployment-url-or-id> --scope ravell-networks-projects
```

