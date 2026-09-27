import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";
import { headers } from "next/headers";

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

const headersMock = vi.mocked(headers);

async function getPop(requestHeaders: Record<string, string>) {
  headersMock.mockResolvedValue(
    new Headers(requestHeaders) as Awaited<ReturnType<typeof headers>>,
  );

  const response = await GET();
  return response.json();
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/pop", () => {
  it("reports the POP, location, and IP family without the address", async () => {
    const body = await getPop({
      "x-vercel-id": "yul1::iad1::knh7v-1790469142116-bec5803b9fa6",
      "x-vercel-ip-city": "Montr%C3%A9al",
      "x-vercel-ip-country": "CA",
      "x-real-ip": "203.0.113.5",
    });

    expect(body).toEqual({
      region: "yul1",
      city: "Montréal",
      country: "CA",
      ipFamily: "ipv4",
    });
    expect(JSON.stringify(body)).not.toContain("203.0.113.5");
  });

  it("detects IPv6 clients", async () => {
    await expect(getPop({ "x-real-ip": "2001:db8::1" })).resolves.toMatchObject(
      { ipFamily: "ipv6" },
    );
  });

  it("treats IPv4-mapped IPv6 as IPv4", async () => {
    await expect(
      getPop({ "x-real-ip": "::ffff:203.0.113.5" }),
    ).resolves.toMatchObject({ ipFamily: "ipv4" });
  });

  it("falls back to the first x-forwarded-for hop", async () => {
    await expect(
      getPop({ "x-forwarded-for": "2001:db8::1, 198.51.100.7" }),
    ).resolves.toMatchObject({ ipFamily: "ipv6" });
  });

  it("returns null when the client address is missing or malformed", async () => {
    await expect(getPop({})).resolves.toMatchObject({ ipFamily: null });
    await expect(getPop({ "x-real-ip": "not-an-ip" })).resolves.toMatchObject({
      ipFamily: null,
    });
  });
});
