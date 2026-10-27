import type { PrismaClient } from "@prisma/client";

const nl = (items: string[]) => items.join("\n");

/**
 * Стартовый контент лендинга автоподбора.
 * Идемпотентно: существующие записи не перезаписываются (правки из админки сохраняются).
 */
export async function seedAutoPodbor(prisma: PrismaClient): Promise<void> {
  const contact = await prisma.contact.findFirst();

  /* settings */
  const settingsExists = await prisma.autoPodborSettings.findUnique({ where: { id: "main" } });
  if (!settingsExists) {
    await prisma.autoPodborSettings.create({
      data: {
        id: "main",
        isActive: true,
        heroBadge: "АВТОПОДБОР · МИНСК И БЕЛАРУСЬ",
        heroTitle: "Живое авто, а не картинка",
        heroHighlight: "Живое авто",
        heroSubtitle:
          "Проверим кузов, технику, пробег и документы до сделки — без сюрпризов после покупки.",
        heroImage: "/images/generated/autopodbor-hero.webp",
        heroImageAlt: "Автомобиль в тёмном гараже перед проверкой",
        priceFrom: 150,
        ctaPrimaryLabel: "Подобрать авто",
        ctaSecondaryLabel: "Тарифы",
        phone: contact?.phone ?? null,
        telegram: contact?.telegram ?? null,
        whatsapp: contact?.whatsapp ?? null,
        viber: contact?.viber ?? null,
        address: contact?.address ?? null,
        workingHours: contact?.workingHours ?? null,
        yearsExperience: 0,
        carsChecked: 0,
        citiesCount: 18,
        guaranteeDays: 30,
        avgSavings: 0,
        reportTime: "30 минут",
        expertName: "Виктор",
        expertRole: "Основатель АВТОWAY",
        expertQuote:
          "Проверяю так, как выбирал бы для себя. Если авто не стоит своих денег — скажу прямо.",
        expertPhoto: "/images/avatar.jpg",
        expertFacts: nl(["Лично проверяю каждый автомобиль", "Работаю по договору", "На связи после покупки"]),
        disclaimer: "Цены — ориентир. Точная стоимость и состав — в договоре.",
        seoTitle: "Автоподбор в Минске и по Беларуси — проверка авто перед покупкой",
        seoDescription:
          "Разовый осмотр, эксперт на день и подбор под ключ. Проверяем кузов, технику, пробег и документы, торгуемся за вас.",
        ogImage: "/images/generated/autopodbor-og.webp",
        noindex: false,
      },
    });
    console.log("  Автоподбор: настройки");
  }

  /* sections */
  const sections: { key: string; title: string | null; subtitle: string | null; description?: string }[] = [
    { key: "quiz", title: "Подберём формат", subtitle: "4 вопроса — и вы увидите подходящий тариф." },
    { key: "risks", title: "Что скрывает объявление", subtitle: "Проверяем до сделки, а не после." },
    { key: "tariffs", title: "Тарифы", subtitle: "Цена и состав — до начала работы." },
    { key: "process", title: "Как проходит подбор", subtitle: "Пять шагов от заявки до ключей." },
    {
      key: "checks",
      title: "Что проверяем",
      subtitle: "Кузов, техника, электроника и документы.",
      description: "Толщиномер · сканер · эндоскоп · подъёмник",
    },
    { key: "guarantees", title: "Почему нам доверяют", subtitle: "Работаем на покупателя, а не на продавца." },
    { key: "expert", title: "Кто будет искать авто", subtitle: null },
    { key: "reviews", title: "Отзывы", subtitle: "Реальные отзывы клиентов." },
    { key: "geography", title: "Работаем по Беларуси", subtitle: "Минск и областные центры." },
    { key: "faq", title: "Вопросы", subtitle: null },
    { key: "lead", title: "Подберём авто под ваш бюджет", subtitle: "Оставьте контакт — вернёмся с вариантами." },
  ];

  for (const [index, section] of sections.entries()) {
    const exists = await prisma.autoPodborSection.findUnique({ where: { key: section.key } });
    if (!exists) {
      await prisma.autoPodborSection.create({
        data: {
          key: section.key,
          title: section.title,
          subtitle: section.subtitle,
          description: section.description ?? null,
          isActive: true,
          sortOrder: index + 1,
        },
      });
    }
  }
  console.log("  Автоподбор: секции");

  /* tariffs */
  const tariffs = [
    {
      slug: "single-check", groupName: "rb", title: "Разовый осмотр", price: 150, priceFrom: true,
      duration: "2–3 часа", icon: "eye", ctaLabel: "Заказать осмотр",
      description: "Проверим авто, которое вы уже нашли.",
      includes: nl(["Кузов и ЛКП", "Двигатель и электроника", "Пробег и документы", "Отчёт с фото"]),
      sortOrder: 1,
    },
    {
      slug: "day-expert", groupName: "rb", title: "Эксперт на день", price: 550, priceFrom: false,
      duration: "8 часов", icon: "clock", ctaLabel: "Записаться",
      description: "Посмотрим несколько вариантов за день.",
      includes: nl(["Маршрут по вариантам", "Осмотры без ограничений", "Сравнение авто", "Помощь в торге"]),
      sortOrder: 2,
    },
    {
      slug: "turnkey", groupName: "rb", title: "Подбор под ключ", price: 1200, priceFrom: true,
      duration: "до результата", icon: "key", ctaLabel: "Подобрать авто",
      badge: "Чаще всего выбирают", isPopular: true,
      description: "Найдём, проверим и сопроводим сделку.",
      includes: nl(["Поиск и отсев", "Выезды и диагностика", "Юридическая проверка", "Торг и сделка"]),
      sortOrder: 3,
    },
    {
      slug: "abroad", groupName: "abroad", title: "Подбор из-за границы", price: 900, priceFrom: true,
      duration: "от 2 недель", icon: "globe", ctaLabel: "Обсудить пригон",
      description: "Европа, США, Корея, Китай.",
      includes: nl(["Подбор лота", "Проверка истории", "Документы и логистика", "Растаможка"]),
      sortOrder: 4,
    },
    {
      slug: "vin-report", groupName: "extra", title: "VIN-отчёт", price: 29, priceFrom: false,
      duration: "1 минута", icon: "document", ctaLabel: "Заказать отчёт",
      description: "История авто по базам.",
      includes: nl(["Залоги и ограничения", "ДТП и пробег", "Регистрации"]),
      sortOrder: 5,
    },
    {
      slug: "new-car", groupName: "extra", title: "Приёмка нового авто", price: 150, priceFrom: false,
      duration: "1–2 часа", icon: "check", ctaLabel: "Заказать приёмку",
      description: "Проверим автомобиль при выдаче.",
      includes: nl(["Кузов и ЛКП", "Комплектность", "Документы"]),
      sortOrder: 6,
    },
    {
      slug: "deal-support", groupName: "extra", title: "Сопровождение сделки", price: 200, priceFrom: false,
      duration: "день покупки", icon: "scale", ctaLabel: "Обсудить сделку",
      description: "Проверим документы и передачу денег.",
      includes: nl(["Договор", "Проверка документов", "ГАИ"]),
      sortOrder: 7,
    },
  ];

  for (const tariff of tariffs) {
    const exists = await prisma.autoPodborTariff.findUnique({ where: { slug: tariff.slug } });
    if (!exists) {
      await prisma.autoPodborTariff.create({
        data: {
          slug: tariff.slug,
          groupName: tariff.groupName,
          title: tariff.title,
          description: tariff.description,
          price: tariff.price,
          priceFrom: tariff.priceFrom,
          currency: "BYN",
          unit: null,
          duration: tariff.duration,
          includes: tariff.includes,
          badge: tariff.badge ?? null,
          icon: tariff.icon,
          ctaLabel: tariff.ctaLabel,
          isPopular: tariff.isPopular ?? false,
          isActive: true,
          sortOrder: tariff.sortOrder,
        },
      });
    }
  }
  console.log("  Автоподбор: тарифы");

  /* steps */
  const steps = [
    { title: "Заявка", duration: "15 минут", description: "Обсуждаем бюджет и задачи." },
    { title: "Поиск", duration: "1–2 дня", description: "Отбираем варианты и звоним продавцам." },
    { title: "Осмотр", duration: "2–3 часа", description: "Кузов, техника, электроника, документы." },
    { title: "Торг и сделка", duration: "день покупки", description: "Снижаем цену и сопровождаем передачу." },
    { title: "Гарантия", duration: "30 дней", description: "Остаёмся на связи после покупки." },
  ];
  if (await prisma.autoPodborStep.count() === 0) {
    for (const [index, step] of steps.entries()) {
      await prisma.autoPodborStep.create({
        data: { ...step, icon: "check", sortOrder: index + 1, isActive: true },
      });
    }
    console.log("  Автоподбор: этапы");
  }

  /* features */
  const features: { type: string; title: string; description: string; icon: string; stat?: string }[] = [
    { type: "risk", title: "Скрученный пробег", description: "Одометр и износ говорят разное.", icon: "gauge" },
    { type: "risk", title: "Скрытые ДТП", description: "Шпаклёвка, сварка и подушки-обманки.", icon: "car" },
    { type: "risk", title: "Залоги и ограничения", description: "Проверяем реестры до сделки.", icon: "shield" },
    { type: "risk", title: "Дорогой ремонт", description: "ДВС, АКПП и электрика могут стоить больше услуги.", icon: "wrench" },

    { type: "advantage", title: "Не продаём авто", description: "Работаем только на покупателя.", icon: "scale" },
    { type: "advantage", title: "Договор и фиксированная цена", description: "Без доплат по ходу.", icon: "document" },
    { type: "advantage", title: "Гарантия 30 дней", description: "На двигатель и КПП.", icon: "shield", stat: "30 дней" },
    { type: "advantage", title: "Торг окупает услугу", description: "Дефекты — аргумент для скидки.", icon: "dollar" },

    { type: "guarantee", title: "30 дней на двигатель и КПП", description: "Если проблема проявилась — разбираемся вместе.", icon: "shield", stat: "30 дней" },
    { type: "guarantee", title: "Юридическая чистота", description: "Залоги, розыск, ограничения и таможня.", icon: "document" },
    { type: "guarantee", title: "Поддержка после покупки", description: "Остаёмся на связи.", icon: "clock" },

    { type: "trust", title: "Договор", description: "", icon: "document" },
    { type: "trust", title: "30+ параметров", description: "", icon: "shield" },
    { type: "trust", title: "Отчёт за 30 минут", description: "", icon: "clock" },
    { type: "trust", title: "Гарантия в договоре", description: "", icon: "check" },
  ];
  if (await prisma.autoPodborFeature.count() === 0) {
    for (const [index, feature] of features.entries()) {
      await prisma.autoPodborFeature.create({
        data: {
          type: feature.type,
          title: feature.title,
          description: feature.description,
          icon: feature.icon,
          stat: feature.stat ?? null,
          sortOrder: index + 1,
          isActive: true,
        },
      });
    }
    console.log("  Автоподбор: карточки");
  }

  /* checks */
  const checks: { category: string; title: string; critical?: boolean }[] = [
    { category: "body", title: "Толщиномер по кузову", critical: true },
    { category: "body", title: "Зазоры и геометрия", critical: true },
    { category: "body", title: "Следы сварки", critical: true },
    { category: "body", title: "Стёкла и оптика" },
    { category: "body", title: "Коррозия и днище" },

    { category: "engine", title: "Запуск и работа", critical: true },
    { category: "engine", title: "Течи масла и антифриза" },
    { category: "engine", title: "Ошибки блока", critical: true },
    { category: "engine", title: "Эндоскопия цилиндров" },
    { category: "engine", title: "АКПП и рывки" },

    { category: "chassis", title: "Подъёмник и люфты", critical: true },
    { category: "chassis", title: "Сайлентблоки и шаровые" },
    { category: "chassis", title: "Ступицы" },
    { category: "chassis", title: "Амортизаторы" },
    { category: "chassis", title: "Тормоза" },

    { category: "electronics", title: "Сканирование блоков", critical: true },
    { category: "electronics", title: "Ошибки и пробег", critical: true },
    { category: "electronics", title: "SRS и подушки" },
    { category: "electronics", title: "Электрика салона" },
    { category: "electronics", title: "Датчики и камеры" },

    { category: "interior", title: "Износ руля и сидений", critical: true },
    { category: "interior", title: "Следы затопления", critical: true },
    { category: "interior", title: "Комплектность и ключи" },
    { category: "interior", title: "Обогревы и климат" },
    { category: "interior", title: "Ремни" },

    { category: "legal", title: "Сверка VIN", critical: true },
    { category: "legal", title: "Техпаспорт" },
    { category: "legal", title: "Залоги и розыск", critical: true },
    { category: "legal", title: "Таможня", critical: true },
    { category: "legal", title: "Автогражданка и техосмотр" },
  ];
  if (await prisma.autoPodborCheckItem.count() === 0) {
    for (const [index, item] of checks.entries()) {
      await prisma.autoPodborCheckItem.create({
        data: {
          category: item.category,
          title: item.title,
          isCritical: item.critical ?? false,
          sortOrder: index + 1,
          isActive: true,
        },
      });
    }
    console.log("  Автоподбор: проверки (30)");
  }

  /* faq */
  const faq: [string, string][] = [
    ["Сколько стоит автоподбор?", "Осмотр — от 150 BYN, подбор под ключ — от 1 200 BYN. Точную цену фиксируем в договоре."],
    ["Сколько времени занимает?", "Осмотр — 2–3 часа. Подбор — от нескольких дней до нескольких недель."],
    ["Можно без моего присутствия?", "Да. Пришлём фото, видео и отчёт в Telegram."],
    ["Даёте гарантию?", "Да, 30 дней на двигатель и КПП по договору."],
    ["Вы продаёте авто?", "Нет. Мы работаем только на покупателя."],
    ["Работаете по всей Беларуси?", "Да, Минск и областные центры. Выезд за МКАД — по договорённости."],
  ];
  if (await prisma.autoPodborFaq.count() === 0) {
    for (const [index, [question, answer]] of faq.entries()) {
      await prisma.autoPodborFaq.create({
        data: { question, answer, sortOrder: index + 1, isActive: true },
      });
    }
    console.log("  Автоподбор: FAQ");
  }

  /* cities */
  const cities: [string, string][] = [
    ["Минск", "minsk"], ["Брест", "brest"], ["Витебск", "vitebsk"], ["Гомель", "gomel"],
    ["Гродно", "grodno"], ["Могилёв", "mogilev"], ["Барановичи", "baranovichi"], ["Бобруйск", "bobruysk"],
    ["Борисов", "borisov"], ["Жодино", "zhodino"], ["Лида", "lida"], ["Мозырь", "mozyr"],
    ["Молодечно", "molodechno"], ["Новополоцк", "novopolotsk"], ["Орша", "orsha"], ["Пинск", "pinsk"],
    ["Полоцк", "polotsk"], ["Солигорск", "soligorsk"],
  ];
  for (const [index, [name, slug]] of cities.entries()) {
    const exists = await prisma.autoPodborCity.findUnique({ where: { slug } });
    if (!exists) {
      await prisma.autoPodborCity.create({ data: { name, slug, sortOrder: index + 1, isActive: true } });
    }
  }
  console.log("  Автоподбор: города");
}

