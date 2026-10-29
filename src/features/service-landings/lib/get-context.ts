import "server-only";
import "@/di/composition-root";
import { notFound } from "next/navigation";
import { container } from "@/di/container";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { ServiceLandingRepository } from "@/entities/service-landing/service-landing.repository";

export async function getServiceLandingContext(slug: string) {
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const landingRepo = container.get<ServiceLandingRepository>("ServiceLandingRepository");
  const [service, contact, landing] = await Promise.all([
    serviceRepo.getBySlug(slug),
    getPrismaClient().contact.findFirst(),
    landingRepo.getBySlug(slug),
  ]);

  if (!service || !service.isActive || !landing || !landing.isActive) notFound();

  return { service, contact, landing };
}
