import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Калькулятор аренды авто — АВТОWAY" },
  description:
    "Рассчитайте стоимость аренды автомобиля в Беларуси: выберите авто, даты и дополнительные опции. Итоговая смета — сразу на странице.",
  alternates: { canonical: "/services/rent/calculator" },
  openGraph: {
    title: "Калькулятор аренды авто — АВТОWAY",
    description: "Выберите автомобиль, даты и опции — стоимость аренды посчитается автоматически.",
    url: "/services/rent/calculator",
    type: "website",
  },
};

export default function RentCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
