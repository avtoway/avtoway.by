import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { Metadata } from "next";

interface ServicePageConfig {
  slug: string;
}

export async function getServicePageData({ slug }: ServicePageConfig) {
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const service = await serviceRepo.getBySlug(slug);
  return service;
}

export function ServiceHero({ title, desc }: { title: string; desc: string }) {
  return (
    <section className="flex min-h-[60dvh] items-center justify-center px-6 text-center">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-5xl font-bold text-white">{title}</h1>
        <p className="text-lg text-zinc-400">{desc}</p>
      </div>
    </section>
  );
}

export function createMetadata(title: string, description: string): Metadata {
  return { title, description };
}
