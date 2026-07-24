export interface ServiceData {
  slug: string;
  title: string;
  desc: string;
  href: string;
  color: string;
  isActive: boolean;
  photo?: string;
  content?: string;
}

export const SERVICES: ServiceData[] = [
  {
    slug: "rent",
    title: "Аренда авто",
    desc: "Авто под такси, просто аренда и подкаты. Прозрачно и честно.",
    href: "/services/rent",
    color: "#3b82f6",
    isActive: true,
  },
  {
    slug: "sell",
    title: "Продажа авто",
    desc: "Продам ваше авто быстро, дорого, без головной боли.",
    href: "/services/sell",
    color: "#f59e0b",
    isActive: true,
  },
  {
    slug: "inspection",
    title: "Автоподбор",
    desc: "Проверю авто от и до. Диагностика, документы, торг — полное сопровождение.",
    href: "/services/inspection",
    color: "#10b981",
    isActive: true,
  },
  {
    slug: "truck",
    title: "Эвакуатор",
    desc: "Быстрая и надёжная эвакуация авто. Круглосуточно.",
    href: "/services/truck",
    color: "#ef4444",
    isActive: false,
  },
  {
    slug: "import",
    title: "Автопригон",
    desc: "Пригон авто из США, Китая, Европы и Кореи. Под ключ.",
    href: "/services/import",
    color: "#8b5cf6",
    isActive: false,
  },
  {
    slug: "service",
    title: "Автосервис",
    desc: "Ремонт и обслуживание автомобилей любой сложности.",
    href: "/services/service",
    color: "#f97316",
    isActive: false,
  },
];

export const HERO_VIDEO = "https://www.youtube.com/watch?v=UCedog9AdcO0AH1roUekmExg";
