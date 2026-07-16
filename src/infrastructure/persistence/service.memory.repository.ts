import { SERVICES, type ServiceData } from "@/shared/config/services";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { Service } from "@/entities/service/service.types";

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
    isActive: s.isActive,
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
    return this.services.filter((s) => s.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async update(slug: string, data: Partial<Service>): Promise<Service> {
    const existing = this.services.find((s) => s.slug === slug);
    if (!existing) throw new Error("Услуга не найдена");
    const updated: Service = { ...existing, ...data };
    this.services = this.services.map((s) => (s.slug === slug ? updated : s));
    return updated;
  }

  async delete(slug: string): Promise<void> {
    const existing = this.services.find((s) => s.slug === slug);
    if (!existing) throw new Error("Услуга не найдена");
    this.services = this.services.filter((s) => s.slug !== slug);
  }
}
