import "server-only";
import "@/di/composition-root";
import { notFound } from "next/navigation";
import { container } from "@/di/container";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import type { ServiceRepository } from "@/entities/service/service.repository";

export async function getServiceLandingContext(slug: string) {
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const [service, contact] = await Promise.all([
    serviceRepo.getBySlug(slug),
    getPrismaClient().contact.findFirst(),
  ]);

  if (!service || !service.isActive) notFound();

  return { service, contact };
}
