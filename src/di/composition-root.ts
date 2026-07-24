import { container } from "./container";
import { MemoryServiceRepository } from "@/infrastructure/persistence/service.memory.repository";
import { MemoryPartnerRepository } from "@/infrastructure/persistence/partner.memory.repository";
import { MemorySettingsRepository } from "@/infrastructure/persistence/settings.memory.repository";
import { YouTubeVideoSource } from "@/features/youtube/api/youtube.video-source";
import { env } from "@/shared/config/env.server";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { PartnerRepository } from "@/entities/partner/partner.repository";
import type { SettingsRepository } from "@/entities/settings/settings.repository";
import type { VideoSource } from "@/entities/video/video-source";
import type { UserRepository } from "@/entities/user/user.repository";
import type { RoleRepository } from "@/entities/role/role.repository";
import type { AuditLogRepository } from "@/entities/audit/audit.repository";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import { PrismaUserRepository } from "@/infrastructure/persistence/user.prisma.repository";
import { PrismaRoleRepository } from "@/infrastructure/persistence/role.prisma.repository";
import { PrismaAuditLogRepository } from "@/infrastructure/persistence/audit.prisma.repository";
import { PrismaRentCarRepository } from "@/infrastructure/persistence/rent.prisma.repository";

function configureDevelopment() {
  container.register<ServiceRepository>("ServiceRepository", new MemoryServiceRepository());
  container.register<PartnerRepository>("PartnerRepository", new MemoryPartnerRepository());
  container.register<SettingsRepository>("SettingsRepository", new MemorySettingsRepository());
  container.register<VideoSource>("VideoSource", new YouTubeVideoSource(
    env.YOUTUBE_API_KEY,
    env.YOUTUBE_CHANNEL_ID,
  ));
  container.register<UserRepository>("UserRepository", new PrismaUserRepository());
  container.register<RoleRepository>("RoleRepository", new PrismaRoleRepository());
  container.register<AuditLogRepository>("AuditLogRepository", new PrismaAuditLogRepository());
  container.register<RentCarRepository>("RentCarRepository", new PrismaRentCarRepository());
}

async function configureProduction() {
  const { PrismaServiceRepository } = await import("@/infrastructure/persistence/service.prisma.repository");
  const { PrismaPartnerRepository } = await import("@/infrastructure/persistence/partner.prisma.repository");

  container.register<ServiceRepository>("ServiceRepository", new PrismaServiceRepository());
  container.register<PartnerRepository>("PartnerRepository", new PrismaPartnerRepository());
  container.register<VideoSource>("VideoSource", new YouTubeVideoSource(
    env.YOUTUBE_API_KEY,
    env.YOUTUBE_CHANNEL_ID,
  ));
  container.register<UserRepository>("UserRepository", new PrismaUserRepository());
  container.register<RoleRepository>("RoleRepository", new PrismaRoleRepository());
  container.register<AuditLogRepository>("AuditLogRepository", new PrismaAuditLogRepository());
  container.register<RentCarRepository>("RentCarRepository", new PrismaRentCarRepository());
}

const isProduction = process.env.NODE_ENV === "production" && !!process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("postgresql://");

if (isProduction) {
  configureProduction().catch(console.error);
} else {
  configureDevelopment();
}
