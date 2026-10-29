import { getPrismaClient } from "./prisma.client";
import type { ServiceLandingRepository } from "@/entities/service-landing/service-landing.repository";
import type { ServiceLanding, ServiceLandingSummary } from "@/entities/service-landing/service-landing.types";

function parseContent(value: string): ServiceLanding["content"] {
  return JSON.parse(value) as ServiceLanding["content"];
}

function toServiceLanding(row: {
  id: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  ogTitle: string | null;
  ogDescription: string | null;
  content: string;
  isActive: boolean;
  updatedAt: Date;
}): ServiceLanding {
  return {
    id: row.id,
    slug: row.slug,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    ogTitle: row.ogTitle ?? undefined,
    ogDescription: row.ogDescription ?? undefined,
    content: parseContent(row.content),
    isActive: row.isActive,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class PrismaServiceLandingRepository implements ServiceLandingRepository {
  async getAll(): Promise<ServiceLandingSummary[]> {
    const rows = await getPrismaClient().serviceLanding.findMany({ orderBy: { slug: "asc" } });
    return rows.map(row => ({
      slug: row.slug,
      seoTitle: row.seoTitle,
      isActive: row.isActive,
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async getBySlug(slug: string): Promise<ServiceLanding | null> {
    const row = await getPrismaClient().serviceLanding.findUnique({ where: { slug } });
    return row ? toServiceLanding(row) : null;
  }

  async update(slug: string, data: {
    seoTitle: string;
    seoDescription: string;
    ogTitle?: string;
    ogDescription?: string;
    content: ServiceLanding["content"];
    isActive?: boolean;
  }): Promise<ServiceLanding> {
    const row = await getPrismaClient().serviceLanding.update({
      where: { slug },
      data: {
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogTitle: data.ogTitle ?? null,
        ogDescription: data.ogDescription ?? null,
        content: JSON.stringify(data.content),
        isActive: data.isActive ?? true,
      },
    });
    return toServiceLanding(row);
  }
}
