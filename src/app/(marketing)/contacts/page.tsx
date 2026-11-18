import type { Metadata } from "next";
import ContactsView from "@/features/contacts/ui/contacts-view";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { getCachedContactInfo } from "@/shared/lib/contact-info.server";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с АВТОWAY. Аренда авто, автоподбор, продажа — звоните или пишите в мессенджеры.",
  alternates: { canonical: "/contacts" },
  openGraph: {
    title: "Контакты | АВТОWAY",
    description: "Телефон, email, адрес, социальные сети и мессенджеры. Всегда на связи.",
    url: "/contacts",
  },
};

export default async function ContactsPage() {
  const info = await getCachedContactInfo();
  const contact = info
    ? {
        phone: info.phone ?? null,
        email: info.email ?? null,
        telegram: info.telegram ?? null,
        viber: info.viber ?? null,
        whatsapp: info.whatsapp ?? null,
        instagram: info.instagram ?? null,
        youtube: info.youtube ?? null,
        rutube: info.rutube ?? null,
        vk: info.vk ?? null,
        address: info.address ?? null,
        workingHours: info.workingHours ?? null,
      }
    : null;

  return (
    <>
      <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />
      <ContactsView contact={contact} />
    </>
  );
}
