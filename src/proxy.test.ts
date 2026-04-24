import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "./proxy";

describe("proxy CSP", () => {
  it("adds a nonce-based CSP in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = proxy(new NextRequest("https://james.cadena.sh/"));
    const csp = response.headers.get("Content-Security-Policy");

    expect(csp).toBeTruthy();
    expect(csp).toMatch(/script-src 'self' 'nonce-[^']+'/);
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("unsafe-inline");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("allows unsafe-eval only in development", () => {
    vi.stubEnv("NODE_ENV", "development");

    const response = proxy(new NextRequest("https://james.cadena.sh/"));
    const csp = response.headers.get("Content-Security-Policy");

    expect(csp).toContain("'unsafe-eval'");
  });
});
