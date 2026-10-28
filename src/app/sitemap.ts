import type { MetadataRoute } from "next";

const BASE_URL = "https://avtoway.by";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/about`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/services`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/services/inspection`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/services/rent`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE_URL}/services/rent/calculator`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/contacts`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE_URL}/privacy`, priority: 0.3, changeFrequency: "yearly" },
  ];
}
