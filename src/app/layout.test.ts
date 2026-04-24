import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-body" }),
  Space_Grotesk: () => ({ variable: "--font-display" }),
}));

import { metadata } from "./layout";
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
