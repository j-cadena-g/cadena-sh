const DEFAULT_CANONICAL_ORIGIN = "https://james.cadena.sh";
const DEFAULT_APEX_ORIGIN = "https://cadena.sh";

function normalizeOrigin(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) return fallback;
  return trimmed;
}

// NEXT_PUBLIC_SITE_URL lets a fork override the canonical origin without
// touching source. Falls back to the production value for this repo.
export const CANONICAL_ORIGIN = normalizeOrigin(
  process.env.NEXT_PUBLIC_SITE_URL,
  DEFAULT_CANONICAL_ORIGIN,
);

export const APEX_ORIGIN = normalizeOrigin(
  process.env.NEXT_PUBLIC_APEX_URL,
  DEFAULT_APEX_ORIGIN,
);

const LOCAL_DEV_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

// Rebuilt per request (not memoized at module scope) so preview deployments
// pick up their own `VERCEL_URL` at runtime. The cost is negligible and
// memoizing would pin the first request's origin for the life of the process.
export function getAllowedContactOrigins() {
  const origins = new Set<string>([CANONICAL_ORIGIN, APEX_ORIGIN]);

  if (process.env.NODE_ENV !== "production") {
    for (const origin of LOCAL_DEV_ORIGINS) {
      origins.add(origin);
    }
  }

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  return origins;
}
