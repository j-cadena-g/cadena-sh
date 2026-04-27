import { headers } from "next/headers";

// `headers()` already forces dynamic rendering, but we make the intent
// explicit so this stays uncached if Next ever changes its defaults.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Parses Vercel's `x-vercel-id` header to extract the originating edge POP.
 *
 * Production format looks roughly like `<pop>::<lambda>::<id>-<ts>` —
 * we only care about the first segment.
 */
function extractRegion(vercelId: string | null): string | null {
  if (!vercelId) {
    return null;
  }

  const [region] = vercelId.split(":");
  return region || null;
}

export async function GET() {
  const requestHeaders = await headers();

  const region =
    extractRegion(requestHeaders.get("x-vercel-id")) ??
    process.env.VERCEL_REGION ??
    "local";

  const cityRaw = requestHeaders.get("x-vercel-ip-city");
  const city = cityRaw ? safeDecode(cityRaw) : null;
  const country = requestHeaders.get("x-vercel-ip-country");

  return Response.json(
    { region, city, country },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
