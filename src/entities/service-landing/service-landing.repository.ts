import type { ServiceLanding, ServiceLandingSummary } from "./service-landing.types";

export interface ServiceLandingRepository {
  getAll(): Promise<ServiceLandingSummary[]>;
  getBySlug(slug: string): Promise<ServiceLanding | null>;
  update(slug: string, data: {
    seoTitle: string;
    seoDescription: string;
    ogTitle?: string;
    ogDescription?: string;
    content: ServiceLanding["content"];
    isActive?: boolean;
  }): Promise<ServiceLanding>;
}
