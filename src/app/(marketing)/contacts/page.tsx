import type { Metadata } from "next";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import ContactsView from "@/features/contacts/ui/contacts-view";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";

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
  const db = getPrismaClient();
  const contact = await db.contact.findFirst();

  return (
    <>
      <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />
      <ContactsView contact={contact} />
    </>
  );
}
