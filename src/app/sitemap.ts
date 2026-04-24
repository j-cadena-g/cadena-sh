import type { MetadataRoute } from "next";

import { CANONICAL_ORIGIN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: CANONICAL_ORIGIN,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
