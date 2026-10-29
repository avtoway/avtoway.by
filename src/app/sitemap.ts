import type { MetadataRoute } from "next";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { SITE_URL } from "@/shared/config/site";

export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

const STATIC_ENTRIES: Entry[] = [
  { url: SITE_URL, priority: 1.0, changeFrequency: "weekly" },
  { url: `${SITE_URL}/about`, priority: 0.8, changeFrequency: "monthly" },
  { url: `${SITE_URL}/services`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${SITE_URL}/services/inspection`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${SITE_URL}/services/sell`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${SITE_URL}/services/rent`, priority: 0.9, changeFrequency: "weekly" },
  { url: `${SITE_URL}/services/rent/calculator`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${SITE_URL}/contacts`, priority: 0.6, changeFrequency: "monthly" },
  { url: `${SITE_URL}/partners`, priority: 0.5, changeFrequency: "monthly" },
  { url: `${SITE_URL}/vacancies`, priority: 0.6, changeFrequency: "weekly" },
  { url: `${SITE_URL}/privacy`, priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, Entry>(STATIC_ENTRIES.map((entry) => [entry.url, entry]));

  try {
    const db = getPrismaClient();
    const [services, cars, saleCars, vacancies] = await Promise.all([
      db.service.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      db.rentCar.findMany({
        where: { isActive: true },
        select: { slug: true, updatedAt: true },
      }),
      db.saleCar.findMany({
        where: { isActive: true, status: { not: "draft" } },
        select: { slug: true, updatedAt: true },
      }),
      db.vacancy.findMany({
        where: { isActive: true, publishedAt: { lte: new Date() } },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    for (const service of services) {
      const url = `${SITE_URL}/services/${service.slug}`;
      if (!entries.has(url)) {
        entries.set(url, {
          url,
          lastModified: service.updatedAt,
          priority: service.slug === "inspection" ? 0.9 : 0.7,
          changeFrequency: "weekly",
        });
      }
    }

    for (const car of cars) {
      const url = `${SITE_URL}/services/rent/${car.slug}`;
      entries.set(url, {
        url,
        lastModified: car.updatedAt,
        priority: 0.6,
        changeFrequency: "weekly",
      });
    }

    for (const car of saleCars) {
      const url = `${SITE_URL}/services/sell/${car.slug}`;
      entries.set(url, {
        url,
        lastModified: car.updatedAt,
        priority: 0.7,
        changeFrequency: "weekly",
      });
    }

    for (const vacancy of vacancies) {
      const url = `${SITE_URL}/vacancies/${vacancy.slug}`;
      entries.set(url, {
        url,
        lastModified: vacancy.updatedAt,
        priority: 0.6,
        changeFrequency: "weekly",
      });
    }
  } catch {
    // Sitemap не должен ронять сайт, если БД временно недоступна.
  }

  return [...entries.values()];
}
