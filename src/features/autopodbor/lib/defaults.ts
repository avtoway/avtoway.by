import type { AutoPodborSection } from "@/entities/autopodbor/autopodbor.types";

export interface SectionHeadingData {
  badge?: string;
  title?: string;
  subtitle?: string;
}

/** Резервные заголовки, если в БД пусто. */
export const DEFAULT_HEADINGS: Record<string, SectionHeadingData> = {
  trust: {},
  quiz: {
    title: "Подберём формат под вашу задачу",
    subtitle: "4 вопроса — и вы поймёте, какая услуга нужна и сколько она стоит. Без обязательств.",
  },
  risks: {
    title: "Что скрывает объявление «не бита, не крашена»",
    subtitle: "Мы видим это на осмотре. Вы — только после покупки, если не проверить.",
  },
  tariffs: {
    title: "Сколько стоит автоподбор",
    subtitle: "Без «уточняйте по телефону». Цена и состав — до начала работы.",
  },
  process: {
    title: "Как проходит подбор",
    subtitle: "От заявки до ключей — 7 понятных шагов. Вы всегда знаете, что происходит.",
  },
  checks: {
    title: "Что мы проверяем",
    subtitle: "100+ параметров: от толщины краски до ошибок в блоках. Не «посмотрели глазами», а проверили прибором.",
  },
  report: {
    title: "Вы получаете не «машина норм», а понятный отчёт",
    subtitle: "150+ фото и видео, замеры, ошибки, комментарии и вердикт: покупать, торговаться или отказаться.",
  },
  cases: {
    title: "Кейсы: что нашли и сколько сэкономили",
    subtitle: "Не «подобрали отличный автомобиль», а цифры: бюджет, цена, торг, срок.",
  },
  guarantees: {
    title: "Почему нам можно доверить выбор",
    subtitle: "Мы работаем на покупателя. Это меняет всё.",
  },
  expert: { title: "Кто будет искать ваше авто" },
  reviews: {
    title: "Отзывы клиентов",
    subtitle: "Реальные отзывы с Яндекс.Карт, Google и Telegram. Не удаляем неудобные.",
  },
  geography: {
    title: "Работаем по всей Беларуси",
    subtitle: "Минск и областные центры. Выезд в район — по договорённости.",
  },
  faq: { title: "Частые вопросы" },
  lead: {
    title: "Расскажите, какую машину ищете",
    subtitle: "Подберём 3–5 вариантов, проверим лучшие и скажем честно, стоит ли покупать.",
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
