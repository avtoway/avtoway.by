import { Suspense } from "react";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import type { ContactInfo } from "@/entities/contact/contact-info.types";
import { telegramUrl } from "@/shared/lib/social";
import HeroSection from "@/features/home/ui/hero-section";
import TaskSection from "@/features/home/ui/task-section";
import ExpressCheck from "@/features/autopodbor/ui/express-check";
import ProcessSection from "@/features/home/ui/process-section";
import AboutSection from "@/features/home/ui/about-section";
import LeadFormSection from "@/features/home/ui/lead-form-section";
import HomeStickyCta from "@/features/home/ui/home-sticky-cta";
import VideoSectionWrapper from "@/features/home/ui/video-section-wrapper";
import VideoSectionSkeleton from "@/shared/ui/video-section-skeleton";
import AdSlotBlock from "@/features/ads/ui/ad-slot";
import { getActiveServices } from "@/shared/lib/active-services.server";

export const revalidate = 300;

async function getContact(): Promise<ContactInfo | null> {
  try {
    return await container.get<ContactInfoRepository>("ContactInfoRepository").get();
  } catch {
    return null;
  }
}

export default async function MarketingHome() {
  const [contact, services] = await Promise.all([getContact(), getActiveServices()]);
  const showExpressCheck = services.some(service => service.slug === "inspection");
  const phone = contact?.phone ?? undefined;
  const telegram = telegramUrl(contact?.telegram) ?? undefined;

  return (
    <>
      <HeroSection />
      {/* Видео сразу после первого экрана: доверие и «живой» контент до выбора услуги. */}
      <Suspense fallback={<VideoSectionSkeleton />}>
        <VideoSectionWrapper />
      </Suspense>
      <TaskSection />
      {showExpressCheck && <ExpressCheck />}
      <ProcessSection />
      <AboutSection />
      <AdSlotBlock slotKey="home_bottom" />
      {/* Заявка — финальный шаг: человек уже увидел услуги, процесс и доверие. */}
      <LeadFormSection
        services={services.map(service => ({ slug: service.slug, title: service.title }))}
        phone={phone}
        telegram={telegram}
      />
      <div className="h-20 lg:hidden" aria-hidden />
      <HomeStickyCta phone={phone} />
    </>
  );
}
