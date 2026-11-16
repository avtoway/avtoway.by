import { Suspense } from "react";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import HeroSection from "@/features/home/ui/hero-section";
import TaskSection from "@/features/home/ui/task-section";
import AboutSection from "@/features/home/ui/about-section";
import HomeStickyCta from "@/features/home/ui/home-sticky-cta";
import VideoSectionWrapper from "@/features/home/ui/video-section-wrapper";
import ServicesSectionWrapper from "@/features/home/ui/services-section-wrapper";
import VideoSectionSkeleton from "@/shared/ui/video-section-skeleton";
import ServicesSectionSkeleton from "@/shared/ui/services-section-skeleton";

export const revalidate = 300;

async function getPhone(): Promise<string | undefined> {
  try {
    return (await container.get<ContactInfoRepository>("ContactInfoRepository").get())?.phone ?? undefined;
  } catch {
    return undefined;
  }
}

export default async function MarketingHome() {
  const phone = await getPhone();

  return (
    <>
      <HeroSection />
      <TaskSection />
      <AboutSection />
      <Suspense fallback={<VideoSectionSkeleton />}>
        <VideoSectionWrapper />
      </Suspense>
      <Suspense fallback={<ServicesSectionSkeleton />}>
        <ServicesSectionWrapper />
      </Suspense>
      <div className="h-20 lg:hidden" aria-hidden />
      <HomeStickyCta phone={phone} />
    </>
  );
}
