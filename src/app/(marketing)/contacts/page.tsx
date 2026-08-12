import type { Metadata } from "next";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import ContactsView from "@/features/contacts/ui/contacts-view";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с АВТОWAY. Аренда авто, автоподбор, продажа — звоните или пишите в мессенджеры.",
  openGraph: {
    title: "Контакты | АВТОWAY",
    description: "Телефон, email, адрес, социальные сети и мессенджеры. Всегда на связи.",
  },
};

export default async function ContactsPage() {
  const db = getPrismaClient();
  const contact = await db.contact.findFirst();

  return <ContactsView contact={contact} />;
}
