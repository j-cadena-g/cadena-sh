import type { NextConfig } from "next";
import { withBotId } from "botid/next/config";

import { APEX_ORIGIN, CANONICAL_ORIGIN } from "@/lib/site";

const apexHost = new URL(APEX_ORIGIN).host;

const productionSecurityHeaders = [
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: false,
  poweredByHeader: false,
  serverExternalPackages: ["@1password/sdk", "@1password/sdk-core"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: apexHost,
          },
        ],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        permanent: true,
      },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [];
    }

    return [
      {
        source: "/(.*)",
        headers: productionSecurityHeaders,
      },
    ];
  },
};

export default withBotId(nextConfig);
