import { container } from "./container";
import { YouTubeVideoSource } from "@/features/youtube/api/youtube.video-source";
import { env } from "@/shared/config/env.server";
import { PrismaUserRepository } from "@/infrastructure/persistence/user.prisma.repository";
import { PrismaRoleRepository } from "@/infrastructure/persistence/role.prisma.repository";
import { PrismaAuditLogRepository } from "@/infrastructure/persistence/audit.prisma.repository";
import { PrismaRentCarRepository } from "@/infrastructure/persistence/rent.prisma.repository";
import { PrismaRentCarHistoryRepository } from "@/infrastructure/persistence/rent-history.prisma.repository";
import { PrismaContactInfoRepository } from "@/infrastructure/persistence/contact.prisma.repository";
import { PrismaServiceRepository } from "@/infrastructure/persistence/service.prisma.repository";
import { PrismaPartnerRepository } from "@/infrastructure/persistence/partner.prisma.repository";
import { PrismaVacancyRepository } from "@/infrastructure/persistence/vacancy.prisma.repository";
import { PrismaContactRequestRepository } from "@/infrastructure/persistence/contact-request.prisma.repository";
import { PrismaAutoPodborRepository } from "@/infrastructure/persistence/autopodbor.prisma.repository";
import { PrismaSaleCarRepository } from "@/infrastructure/persistence/sale-car.prisma.repository";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { PartnerRepository } from "@/entities/partner/partner.repository";
import type { VacancyRepository } from "@/entities/vacancy/vacancy.repository";
import type { ContactRepository } from "@/entities/contact/contact.repository";
import type { VideoSource } from "@/entities/video/video-source";
import type { UserRepository } from "@/entities/user/user.repository";
import type { RoleRepository } from "@/entities/role/role.repository";
import type { AuditLogRepository } from "@/entities/audit/audit.repository";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentCarHistoryRepository } from "@/entities/rent/rent-car-history.repository";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";

function configureContainer() {
  container.register<ServiceRepository>("ServiceRepository", new PrismaServiceRepository());
  container.register<PartnerRepository>("PartnerRepository", new PrismaPartnerRepository());
  container.register<VacancyRepository>("VacancyRepository", new PrismaVacancyRepository());
  container.register<VideoSource>("VideoSource", new YouTubeVideoSource(
    env.YOUTUBE_API_KEY,
    env.YOUTUBE_CHANNEL_ID,
  ));
  container.register<UserRepository>("UserRepository", new PrismaUserRepository());
  container.register<RoleRepository>("RoleRepository", new PrismaRoleRepository());
  container.register<AuditLogRepository>("AuditLogRepository", new PrismaAuditLogRepository());
  container.register<RentCarRepository>("RentCarRepository", new PrismaRentCarRepository());
  container.register<RentCarHistoryRepository>("RentCarHistoryRepository", new PrismaRentCarHistoryRepository());
  container.register<ContactInfoRepository>("ContactInfoRepository", new PrismaContactInfoRepository());
  container.register<ContactRepository>("ContactRepository", new PrismaContactRequestRepository());
  container.register<AutoPodborRepository>("AutoPodborRepository", new PrismaAutoPodborRepository());
  container.register<SaleCarRepository>("SaleCarRepository", new PrismaSaleCarRepository());
}

configureContainer();
