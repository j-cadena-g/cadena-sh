import { vi } from "vitest";

import nextConfig from "./next.config";

describe("next.config", () => {
  it("redirects apex-domain traffic to the canonical subdomain", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toBeDefined();
    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/:path*",
          has: expect.arrayContaining([
            expect.objectContaining({
              type: "host",
              value: "cadena.sh",
            }),
          ]),
          destination: "https://james.cadena.sh/:path*",
          permanent: true,
        }),
      ]),
    );
  });

  it("proxies the BotID challenge through the origin", async () => {
    const rewrites = await nextConfig.rewrites?.();

    const rules = Array.isArray(rewrites)
      ? rewrites
      : (rewrites?.beforeFiles ?? []);

    const proxiesToVercelBotProtection = rules.some((rule) =>
      typeof rule.destination === "string"
        ? rule.destination.startsWith("https://api.vercel.com/bot-protection/")
        : false,
    );

    expect(proxiesToVercelBotProtection).toBe(true);
  });

  it("applies baseline security headers in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const headers = await nextConfig.headers?.();

    expect(headers).toBeDefined();
    expect(headers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/(.*)",
          headers: expect.arrayContaining([
            expect.objectContaining({
              key: "X-Content-Type-Options",
              value: "nosniff",
            }),
            expect.objectContaining({
              key: "Referrer-Policy",
              value: "strict-origin-when-cross-origin",
            }),
            expect.objectContaining({
              key: "X-Frame-Options",
              value: "DENY",
            }),
            expect.objectContaining({
              key: "Cross-Origin-Opener-Policy",
              value: "same-origin",
            }),
            expect.objectContaining({
              key: "Cross-Origin-Resource-Policy",
              value: "same-origin",
            }),
            expect.objectContaining({
              key: "Permissions-Policy",
              value: expect.stringContaining("camera=()"),
            }),
          ]),
        }),
      ]),
    );
  });

  it("keeps the 1Password SDK external so its WASM runtime is traced", () => {
    expect(nextConfig.serverExternalPackages).toEqual(
      expect.arrayContaining(["@1password/sdk", "@1password/sdk-core"]),
    );
  });

  it("disables the x-powered-by header", () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it("does not emit site-wide security headers outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const headers = (await nextConfig.headers?.()) ?? [];
    const siteWide = headers.filter((entry) => entry.source === "/(.*)");

    expect(siteWide).toEqual([]);
  });
});
