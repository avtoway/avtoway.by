import { SERVICES, type ServiceData } from "@/shared/config/services";
import type { ServiceRepository } from "./service.repository";
import type { Service } from "./service.types";

const iconNames: Record<string, string> = {
  "#ef4444": "youtube",
  "#3b82f6": "car",
  "#10b981": "check-circle",
  "#f59e0b": "dollar",
};

function toService(s: ServiceData, index: number): Service {
  return {
    slug: s.slug,
    title: s.title,
    desc: s.desc,
    href: s.href,
    color: s.color,
    iconName: iconNames[s.color] ?? "default",
    isActive: true,
    sortOrder: index,
  };
}

export class MemoryServiceRepository implements ServiceRepository {
  private services: Service[] = SERVICES.map(toService);

  async getAll(): Promise<Service[]> {
    return [...this.services];
  }

  async getBySlug(slug: string): Promise<Service | null> {
    return this.services.find((s) => s.slug === slug) ?? null;
  }

  async getActive(): Promise<Service[]> {
    return this.services.filter((s) => s.isActive);
  }
}
