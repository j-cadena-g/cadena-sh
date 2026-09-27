import { BlockList, isIP } from "node:net";

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

// IPv4-mapped IPv6 lives in ::ffff:0:0/96. BlockList normalizes IPv6 before matching, so this catches
// every spelling: dotted (::ffff:203.0.113.5), hex (::ffff:cb00:7105), and
// fully expanded.
const ipv4Mapped = new BlockList();
ipv4Mapped.addSubnet("::ffff:0:0", 96, "ipv6");

/**
 * Classifies the address the edge accepted the connection from. Only the
 * family leaves this function; the visitor's address is never echoed back.
 *
 * Vercel sets `x-real-ip`; `x-forwarded-for` covers `next dev` and other
 * proxies. IPv4-mapped IPv6 (`::ffff:203.0.113.5`) is a v4 connection seen
 * through a dual-stack socket, so it counts as IPv4.
 */
function extractIpFamily(
  realIp: string | null,
  forwardedFor: string | null,
): "ipv4" | "ipv6" | null {
  const address = (realIp ?? forwardedFor?.split(",")[0])?.trim();

  if (!address) {
    return null;
  }

  switch (isIP(address)) {
    case 4:
      return "ipv4";
    case 6:
      return ipv4Mapped.check(address, "ipv6") ? "ipv4" : "ipv6";
    default:
      return null;
  }
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
  const ipFamily = extractIpFamily(
    requestHeaders.get("x-real-ip"),
    requestHeaders.get("x-forwarded-for"),
  );

  return Response.json(
    { region, city, country, ipFamily },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
