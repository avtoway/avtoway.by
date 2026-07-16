import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import ServicesCarousel from "@/features/home/ui/services-carousel";

export default async function ServicesSectionWrapper() {
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const services = await serviceRepo.getActive();
  return <ServicesCarousel items={services} />;
}
