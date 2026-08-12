import type { Metadata } from "next";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
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

export default async function AboutPage() {
  const db = getPrismaClient();
  const contact = await db.contact.findFirst();

  const socialLinks: { label: string; href: string; color: string; border: string; text: string; shadow: string; icon: string }[] = [];
  if (contact?.youtube) socialLinks.push({ label: "YouTube", href: contact.youtube, color: "#ef4444", border: "hover:border-red-500/40", text: "hover:text-red-400", shadow: "hover:shadow-red-500/20", icon: "youtube" });
  if (contact?.instagram) socialLinks.push({ label: "Instagram", href: contact.instagram, color: "#ec4899", border: "hover:border-pink-500/40", text: "hover:text-pink-400", shadow: "hover:shadow-pink-500/20", icon: "instagram" });
  if (contact?.rutube) socialLinks.push({ label: "Rutube", href: contact.rutube, color: "#8b5cf6", border: "hover:border-violet-500/40", text: "hover:text-violet-400", shadow: "hover:shadow-violet-500/20", icon: "rutube" });
  if (contact?.vk) socialLinks.push({ label: "VK Видео", href: contact.vk, color: "#3b82f6", border: "hover:border-blue-500/40", text: "hover:text-blue-400", shadow: "hover:shadow-blue-500/20", icon: "vk" });

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
      <AboutSocial links={socialLinks} />
      <AboutCta />
    </>
  );
}
