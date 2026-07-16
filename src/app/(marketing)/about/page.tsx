import type { Metadata } from "next";
import AboutHero from "@/features/about/ui/about-hero";
import AboutStory from "@/features/about/ui/about-story";
import AboutTimeline from "@/features/about/ui/about-timeline";
import AboutSocial from "@/features/about/ui/about-social";
import AboutCta from "@/features/about/ui/about-cta";
import { ServiceSchema } from "@/shared/ui/json-ld";

export const metadata: Metadata = {
  title: "О проекте",
  description:
    "АВТОWAY — личный бренд Виктора про автомобили. Честные обзоры, ремонты, услуги: аренда, автоподбор, продажа.",
  openGraph: {
    title: "О проекте | АВТОWAY",
    description: "История создания бренда, таймлайн, социальные сети.",
  },
};

export default function AboutPage() {
  return (
    <>
      <ServiceSchema
        name="АВТОWAY — личный бренд"
        description="Честные обзоры, ремонты, лайфхаки и полезные услуги про автомобили."
        url="/about"
      />
      <AboutHero />
      <AboutStory />
      <AboutTimeline />
      <AboutSocial />
      <AboutCta />
    </>
  );
}
