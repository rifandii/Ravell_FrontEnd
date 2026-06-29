# API Contract Workflow

Last reviewed: 2026-06-29

## Contract Source

The backend Django Ninja OpenAPI artifact is the source of truth:

```text
../Ravell_BackEnd/openapi/ravell-api.openapi.json
```

The frontend stores a generated snapshot and generated TypeScript contracts:

```text
src/types/generated/ravell-api.openapi.json
src/types/generated/api.ts
```

These files are generated artifacts. Do not edit them manually.

## Commands

Regenerate contracts when the backend schema changes:

```bash
npm run api:types
```

Check generated output without writing files:

```bash
npm run api:types:check
```

Run TypeScript validation against the generated contracts:

```bash
npm run typecheck
```

When the backend repository is available beside the frontend repository,
`npm run api:types` reads the backend OpenAPI artifact directly. In isolated
frontend CI, the command uses the committed frontend schema snapshot.

## Boundary

Generated types under `src/types/generated/` represent API wire contracts only.
The manually maintained `src/types/types.ts` file remains the frontend view
model boundary. Compatibility aliases live in `src/types/api-contracts.ts` so
the API client can typecheck against generated transport contracts without
forcing every UI component to import generated OpenAPI shapes.

Generated contracts protect schema drift. They do not replace API integration
tests, authorization tests, or runtime response validation.

## Required Validation

Before merging an API contract change:

```bash
npm run api:types
npm run api:types:check
npm run typecheck
```

The frontend CI workflow runs `npm run api:types:check` and `npm run typecheck`
to catch stale generated files and incompatible TypeScript changes.
