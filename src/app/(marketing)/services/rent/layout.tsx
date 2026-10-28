import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Аренда авто в Минске и Беларуси — АВТОWAY" },
  description:
    "Аренда автомобилей в Минске и по Беларуси: эконом, комфорт, бизнес, SUV и минивэны. Прозрачные цены, скидки за длительный срок, помощь с документами.",
  alternates: { canonical: "/services/rent" },
  openGraph: {
    title: "Аренда авто в Минске и Беларуси — АВТОWAY",
    description: "Автопарк на любой случай: от эконома до бизнес-класса. Рассчитайте стоимость онлайн.",
    url: "/services/rent",
    type: "website",
  },
};

export default function RentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
