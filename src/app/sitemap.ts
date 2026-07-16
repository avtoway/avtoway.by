import type { MetadataRoute } from "next";

const BASE_URL = "https://avtoway.by";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/about`, priority: 0.8, changeFrequency: "monthly" },
  ];
}
