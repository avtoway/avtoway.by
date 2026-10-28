import type { AutoPodborSection } from "@/entities/autopodbor/autopodbor.types";

export interface SectionHeadingData {
  badge?: string;
  title?: string;
  subtitle?: string;
}

/** Резервные заголовки, если в БД пусто. */
export const DEFAULT_HEADINGS: Record<string, SectionHeadingData> = {
  quiz: {
    title: "С чего начать?",
    subtitle: "Выберите задачу — остальное уточним при звонке.",
  },
  risks: {
    title: "Что скрывает объявление",
    subtitle: "Проверяем до сделки, а не после.",
  },
  tariffs: {
    title: "Тарифы",
    subtitle: "Цена и состав — до начала работы.",
  },
  process: {
    title: "Как проходит подбор",
    subtitle: "Пять шагов от заявки до ключей.",
  },
  checks: {
    title: "Что проверяем",
    subtitle: "Кузов, техника, электроника и документы.",
  },
  guarantees: {
    title: "Почему нам доверяют",
    subtitle: "Работаем на покупателя, а не на продавца.",
  },
  expert: { title: "Кто будет искать авто" },
  reviews: {
    title: "Отзывы",
    subtitle: "Реальные отзывы клиентов.",
  },
  faq: { title: "Вопросы" },
  lead: {
    title: "Подберём авто под ваш бюджет",
    subtitle: "Оставьте контакт — вернёмся с вариантами.",
  },
};

export function sectionHeading(sections: AutoPodborSection[], key: string): SectionHeadingData {
  const fromDb = sections.find(s => s.key === key);
  const fallback = DEFAULT_HEADINGS[key] ?? {};
  return {
    badge: fromDb?.badge ?? fallback.badge,
    title: fromDb?.title || fallback.title,
    subtitle: fromDb?.subtitle || fallback.subtitle,
  };
}

export function isSectionActive(sections: AutoPodborSection[], key: string): boolean {
  const section = sections.find(s => s.key === key);
  return section ? section.isActive : true;
}

/** Телефон → tel:, WhatsApp → wa.me, Viber → viber:// */
export function phoneHref(phone?: string): string | undefined {
  if (!phone) return undefined;
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function whatsappHref(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function viberHref(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^viber:\/\//i.test(value)) return value;
  return `viber://chat?number=${encodeURIComponent(value.replace(/\D/g, ""))}`;
}
