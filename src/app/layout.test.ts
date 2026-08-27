import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-body" }),
  Space_Grotesk: () => ({ variable: "--font-display" }),
}));

import { metadata, viewport } from "./layout";
import { CANONICAL_ORIGIN } from "@/lib/site";

describe("layout metadata", () => {
  it("defines explicit social images for open graph and twitter cards", () => {
    const expectedSocialImage = `${CANONICAL_ORIGIN}/opengraph-image`;

    expect(metadata.openGraph?.images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: expectedSocialImage,
          alt: "James Cadena",
        }),
      ]),
    );

    expect(metadata.twitter?.images).toEqual(
      expect.arrayContaining([expectedSocialImage]),
    );
  });
});

describe("layout viewport", () => {
  it("advertises both color schemes", () => {
    expect(viewport.colorScheme).toBe("dark light");
    expect(viewport.themeColor).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          media: "(prefers-color-scheme: light)",
        }),
        expect.objectContaining({
          media: "(prefers-color-scheme: dark)",
          color: "#050505",
        }),
      ]),
    );
  });
});
