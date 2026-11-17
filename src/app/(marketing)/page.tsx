import { Suspense } from "react";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import HeroSection from "@/features/home/ui/hero-section";
import ServiceTicker from "@/features/home/ui/service-ticker";
import TaskSection from "@/features/home/ui/task-section";
import ExpressCheck from "@/features/autopodbor/ui/express-check";
import AboutSection from "@/features/home/ui/about-section";
import HomeStickyCta from "@/features/home/ui/home-sticky-cta";
import VideoSectionWrapper from "@/features/home/ui/video-section-wrapper";
import ServicesSectionWrapper from "@/features/home/ui/services-section-wrapper";
import VideoSectionSkeleton from "@/shared/ui/video-section-skeleton";
import ServicesSectionSkeleton from "@/shared/ui/services-section-skeleton";
import AdSlotBlock from "@/features/ads/ui/ad-slot";
import { getActiveServices } from "@/shared/lib/active-services.server";

export const revalidate = 300;

async function getPhone(): Promise<string | undefined> {
  try {
    return (await container.get<ContactInfoRepository>("ContactInfoRepository").get())?.phone ?? undefined;
  } catch {
    return undefined;
  }
}

export default async function MarketingHome() {
  const [phone, services] = await Promise.all([getPhone(), getActiveServices()]);
  const showExpressCheck = services.some(service => service.slug === "inspection");

  return (
    <>
      <HeroSection />
      <ServiceTicker />
      <TaskSection />
      <AdSlotBlock slotKey="home_top" />
      {showExpressCheck && <ExpressCheck />}
      <AboutSection />
      <Suspense fallback={<VideoSectionSkeleton />}>
        <VideoSectionWrapper />
      </Suspense>
      <Suspense fallback={<ServicesSectionSkeleton />}>
        <ServicesSectionWrapper />
      </Suspense>
      <AdSlotBlock slotKey="home_bottom" />
      <div className="h-20 lg:hidden" aria-hidden />
      <HomeStickyCta phone={phone} />
    </>
  );
}
