import sitemap from "./sitemap";
import { CANONICAL_ORIGIN } from "@/lib/site";

describe("sitemap", () => {
  it("does not attach a synthetic lastModified timestamp", () => {
    expect(sitemap()).toEqual([
      {
        url: CANONICAL_ORIGIN,
        changeFrequency: "monthly",
        priority: 1,
      },
    ]);
  });
});
