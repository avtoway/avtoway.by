export interface ServiceData {
  slug: string;
  title: string;
  desc: string;
  href: string;
  color: string;
}

export const SERVICES: ServiceData[] = [
  {
    slug: "video",
    title: "Видео ремонты и обзоры",
    desc: "Смотрю, делаю, показываю. Честные обзоры и живые ремонты.",
    href: "https://youtube.com/@avtoway",
    color: "#ef4444",
  },
  {
    slug: "rent",
    title: "Аренда авто",
    desc: "Авто под такси, просто аренда и подкаты. Прозрачно и честно.",
    href: "/rent",
    color: "#3b82f6",
  },
  {
    slug: "inspection",
    title: "Автоподбор",
    desc: "Проверю авто от и до. Диагностика, документы, торг — полное сопровождение.",
    href: "/inspection",
    color: "#10b981",
  },
  {
    slug: "sell",
    title: "Продажа авто",
    desc: "Продам ваше авто быстро, дорого, без головной боли.",
    href: "/sell",
    color: "#f59e0b",
  },
];
