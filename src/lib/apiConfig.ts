// Single source of truth for the backend API origin across server components,
// client components, and route handlers. NEXT_PUBLIC_ values are inlined at
// build time, so this module is safe to import from both runtimes.
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ravell.tech').replace(/\/+$/, '');
