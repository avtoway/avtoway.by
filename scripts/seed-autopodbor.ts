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
        heroBadge: "АВТОПОДБОР · МИНСК И ВСЯ БЕЛАРУСЬ",
        heroTitle: "Найдём живое авто, а не красивую картинку",
        heroHighlight: "живое авто",
        heroSubtitle:
          "Проверим кузов, технику, пробег и документы до сделки. Найдём вариант, который не придётся ремонтировать сразу после покупки, — и сторгуем больше, чем стоит наша услуга.",
        heroImage: "/images/generated/autopodbor-hero.webp",
        heroImageAlt: "Эксперт АВТОWAY проверяет автомобиль в тёмном гараже",
        priceFrom: 150,
        ctaPrimaryLabel: "Подобрать авто",
        ctaSecondaryLabel: "Смотреть тарифы",
        phone: contact?.phone ?? null,
        telegram: contact?.telegram ?? null,
        whatsapp: contact?.whatsapp ?? null,
        viber: contact?.viber ?? null,
        address: contact?.address ?? null,
        workingHours: contact?.workingHours ?? null,
        yearsExperience: 0,
        carsChecked: 0,
        citiesCount: 0,
        guaranteeDays: 30,
        avgSavings: 0,
        reportTime: "30 минут",
        expertName: "Виктор",
        expertRole: "Эксперт АВТОWAY",
        expertQuote:
          "Я не продаю машины. Я проверяю их так, как проверял бы для себя. Если авто не стоит своих денег, я скажу это прямо.",
        expertFacts: nl(["Толщиномер, сканер, эндоскоп", "Работаю по договору", "Выезд по всей Беларуси"]),
        disclaimer: "Цены указаны справочно. Финальная стоимость и состав услуг фиксируются в договоре.",
        seoTitle: "Автоподбор в Минске и Беларуси — проверка авто перед покупкой | АВТОWAY",
        seoDescription:
          "Автоподбор под ключ, разовый осмотр и эксперт на день. Проверяем кузов, двигатель, пробег и документы, торгуемся за вас. Отчёт с фото и видео, договор, гарантия.",
        ogImage: "/images/generated/autopodbor-og.webp",
        noindex: false,
      },
    });
    console.log("  Автоподбор: настройки");
  } else if (!settingsExists.expertName) {
    // Новые поля эксперта — заполняем один раз, не трогая правки из админки
    await prisma.autoPodborSettings.update({
      where: { id: "main" },
      data: {
        expertName: "Виктор",
        expertRole: "Эксперт АВТОWAY",
        expertQuote:
          "Я не продаю машины. Я проверяю их так, как проверял бы для себя. Если авто не стоит своих денег, я скажу это прямо.",
        expertFacts: nl(["Толщиномер, сканер, эндоскоп", "Работаю по договору", "Выезд по всей Беларуси"]),
      },
    });
  }

  /* sections */
  const sections = [
    { key: "trust", title: null, subtitle: null },
    { key: "quiz", title: "Подберём формат под вашу задачу", subtitle: "4 вопроса — и вы поймёте, какая услуга нужна и сколько она стоит. Без обязательств." },
    { key: "risks", title: "Что скрывает объявление «не бита, не крашена»", subtitle: "Мы видим это на осмотре. Вы — только после покупки, если не проверить." },
    { key: "tariffs", title: "Сколько стоит автоподбор", subtitle: "Без «уточняйте по телефону». Цена и состав — до начала работы." },
    { key: "process", title: "Как проходит подбор", subtitle: "От заявки до ключей — 7 понятных шагов. Вы всегда знаете, что происходит." },
    { key: "checks", title: "Что мы проверяем", subtitle: "100+ параметров: от толщины краски до ошибок в блоках. Не «посмотрели глазами», а проверили прибором." },
    { key: "report", title: "Вы получаете не «машина норм», а понятный отчёт", subtitle: "150+ фото и видео, замеры, ошибки, комментарии и вердикт: покупать, торговаться или отказаться." },
    { key: "cases", title: "Кейсы: что нашли и сколько сэкономили", subtitle: "Не «подобрали отличный автомобиль», а цифры: бюджет, цена, торг, срок." },
    { key: "guarantees", title: "Почему нам можно доверить выбор", subtitle: "Мы работаем на покупателя. Это меняет всё." },
    { key: "expert", title: "Кто будет искать ваше авто", subtitle: null },
    { key: "reviews", title: "Отзывы клиентов", subtitle: "Реальные отзывы с Яндекс.Карт, Google и Telegram. Не удаляем неудобные." },
    { key: "geography", title: "Работаем по всей Беларуси", subtitle: "Минск и областные центры. Выезд в район — по договорённости." },
    { key: "faq", title: "Частые вопросы", subtitle: null },
    { key: "lead", title: "Расскажите, какую машину ищете", subtitle: "Подберём 3–5 вариантов, проверим лучшие и скажем честно, стоит ли покупать." },
  ];

  for (const [index, section] of sections.entries()) {
    const exists = await prisma.autoPodborSection.findUnique({ where: { key: section.key } });
    if (!exists) {
      await prisma.autoPodborSection.create({
        data: {
          key: section.key,
          title: section.title,
          subtitle: section.subtitle,
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
      description: "Вы уже нашли авто — проверяем его до передачи денег.",
      includes: nl(["100+ параметров", "Толщиномер и сканер", "Тест-драйв", "Проверка пробега", "Фото/видео отчёт", "Торг с продавцом"]),
      sortOrder: 1,
    },
    {
      slug: "day-expert", groupName: "rb", title: "Эксперт на день", price: 550, priceFrom: false,
      duration: "8 часов", icon: "clock", ctaLabel: "Записаться на день",
      badge: "Выгодно, если вариантов несколько",
      description: "Смотрим 3–6 авто за день и выбираем лучший.",
      includes: nl(["Маршрут по вариантам", "Неограниченное число осмотров", "Сравнение авто", "Помощь в торге", "Отчёт по каждому"]),
      sortOrder: 2,
    },
    {
      slug: "turnkey", groupName: "rb", title: "Подбор «под ключ»", price: 1200, priceFrom: true,
      duration: "до результата", icon: "key", ctaLabel: "Подобрать под ключ",
      badge: "Чаще всего выбирают", isPopular: true,
      description: "Берём на себя поиск, осмотры, торг и сделку.",
      includes: nl(["Анализ рынка", "Поиск и отсев", "Выезды и диагностика", "Юр. проверка", "Торг", "Сопровождение сделки", "Гарантия в договоре"]),
      sortOrder: 3,
    },
    {
      slug: "europe", groupName: "abroad", title: "Подбор из Европы", price: 1500, priceFrom: true,
      duration: "от 2 недель", icon: "globe", ctaLabel: "Обсудить пригон",
      description: "Найдём, проверим и пригоним авто под ваш бюджет.",
      includes: nl(["Подбор на площадках и аукционах", "Проверка истории", "Осмотр", "Документы", "Логистика", "Растаможка", "Сопровождение"]),
      sortOrder: 4,
    },
    {
      slug: "usa-korea-china", groupName: "abroad", title: "США / Корея / Китай", price: 900, priceFrom: true,
      duration: "от 3 недель", icon: "globe", ctaLabel: "Обсудить пригон",
      description: "Подбор на аукционах и площадках с полным сопровождением.",
      includes: nl(["Подбор лота", "Проверка истории", "Осмотр на площадке", "Документы", "Логистика", "Растаможка", "Сопровождение"]),
      sortOrder: 5,
    },
    {
      slug: "vin-report", groupName: "extra", title: "VIN-отчёт", price: 29, priceFrom: false,
      duration: "1 минута", icon: "document", ctaLabel: "Заказать отчёт",
      description: "Проверка истории по базам: залоги, ДТП, пробег.",
      includes: nl(["Госбазы РБ", "История регистраций", "Залоги и ограничения", "Проверка пробега"]),
      sortOrder: 6,
    },
    {
      slug: "new-car", groupName: "extra", title: "Приёмка нового авто", price: 150, priceFrom: false,
      duration: "1–2 часа", icon: "check", ctaLabel: "Заказать приёмку",
      description: "Проверим новый автомобиль при выдаче в салоне.",
      includes: nl(["Кузов и ЛКП", "Комплектность", "Электроника", "Документы", "Тест-драйв"]),
      sortOrder: 7,
    },
    {
      slug: "deal-support", groupName: "extra", title: "Сопровождение сделки", price: 200, priceFrom: false,
      duration: "день покупки", icon: "scale", ctaLabel: "Заказать сопровождение",
      description: "Проверим документы и сопроводим передачу денег.",
      includes: nl(["Проверка документов", "Договор купли-продажи", "Передача денег", "ГАИ"]),
      sortOrder: 8,
    },
    {
      slug: "sale-help", groupName: "extra", title: "Помощь в продаже", price: 100, priceFrom: false,
      duration: "1 день", icon: "car", ctaLabel: "Обсудить продажу",
      description: "Поможем продать авто быстрее и дороже.",
      includes: nl(["Оценка рынка", "Подготовка объявления", "Фото и текст", "Общение с покупателями"]),
      sortOrder: 9,
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
    { title: "Заявка и бриф", duration: "15 минут", description: "Обсуждаем бюджет, задачи, марки и сроки. Фиксируем критерии." },
    { title: "Анализ рынка и отбор", duration: "1–2 дня", description: "Мониторим площадки, отсеиваем слабые объявления, звоним продавцам." },
    { title: "Выезд и диагностика", duration: "2–3 часа", description: "Кузов, техника, электроника, пробег, документы, тест-драйв." },
    { title: "Отчёт и вердикт", duration: "30 минут", description: "Фото, видео, замеры и понятный вывод: покупать, торговаться или отказаться." },
    { title: "Торг", duration: "на месте", description: "Используем найденные дефекты как аргументы и снижаем цену." },
    { title: "Сделка и переоформление", duration: "день покупки", description: "Проверяем документы, сопровождаем передачу денег и ГАИ." },
    { title: "Гарантия и поддержка", duration: "30 дней", description: "Остаёмся на связи и отвечаем на вопросы по обслуживанию." },
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
    { type: "risk", title: "Скрученный пробег", description: "Одометр показывает 120 000, а износ руля, педалей и данные блоков говорят о 250 000.", icon: "gauge" },
    { type: "risk", title: "Скрытые ДТП", description: "Шпаклёвка, переваренные лонжероны, подушки-обманки и ремонт, который держится на честном слове.", icon: "car" },
    { type: "risk", title: "Залоги и ограничения", description: "Машину могут изъять у добросовестного покупателя. Проверяем реестры до сделки.", icon: "shield" },
    { type: "risk", title: "«Конструктор» и утопленники", description: "Сварка из двух кузовов, следы затопления, коррозия в скрытых полостях.", icon: "wrench" },
    { type: "risk", title: "Перекупщики и «подготовка»", description: "Свежая полировка, химчистка и красивый рассказ скрывают историю и дефекты.", icon: "search" },
    { type: "risk", title: "Дорогой ремонт", description: "ДВС, АКПП, подвеска, электрика. Счёт после покупки может быть больше стоимости услуг.", icon: "dollar" },

    { type: "advantage", title: "Не продаём авто", description: "У нас нет машины, которую нужно «втюхать». Наша работа — найти лучший вариант для вас.", icon: "scale" },
    { type: "advantage", title: "Договор и фиксированная цена", description: "Состав, сроки и стоимость фиксируем до начала работы. Без скрытых доплат.", icon: "document" },
    { type: "advantage", title: "Гарантия", description: "30 дней на двигатель и КПП по договору. Если что-то упустили — разбираемся.", icon: "shield", stat: "30 дней" },
    { type: "advantage", title: "Юридическая чистота", description: "Залоги, розыск, ограничения, таможня, техосмотр, ОСАГО.", icon: "check" },
    { type: "advantage", title: "Торг окупает услугу", description: "Найденные дефекты — аргумент для снижения цены. Часто торг перекрывает стоимость подбора.", icon: "dollar" },
    { type: "advantage", title: "Можно без вашего присутствия", description: "Проверим, снимем фото и видео, отправим отчёт в Telegram/WhatsApp.", icon: "phone" },

    { type: "guarantee", title: "30 дней на двигатель и КПП", description: "Если в течение месяца проявится проблема, которую мы могли увидеть на осмотре, — разбираемся вместе.", icon: "shield", stat: "30 дней" },
    { type: "guarantee", title: "Юридическая чистота", description: "Проверяем залоги, розыск, ограничения и таможню до передачи денег.", icon: "document" },
    { type: "guarantee", title: "Договор и фиксированная цена", description: "Стоимость и состав работ фиксируются в договоре до начала подбора.", icon: "scale" },
    { type: "guarantee", title: "Поддержка после покупки", description: "Остаёмся на связи и отвечаем на вопросы по обслуживанию.", icon: "clock" },

    { type: "trust", title: "Работаем по договору", description: "", icon: "document" },
    { type: "trust", title: "Не продаём авто", description: "", icon: "scale" },
    { type: "trust", title: "Отчёт в Telegram", description: "", icon: "telegram" },
    { type: "trust", title: "Выезд по всей Беларуси", description: "", icon: "car" },
    { type: "trust", title: "Гарантия в договоре", description: "", icon: "shield" },
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
  const checks: Record<string, string[]> = {
    body: ["Толщиномер по всем элементам", "Зазоры и геометрия кузова", "Следы сварки и герметика", "Крепёж и демонтаж деталей", "Стёкла и оптика", "Коррозия и скрытые полости", "История окраса", "Состояние днища и порогов"],
    engine: ["Запуск холодного двигателя", "Течи масла и антифриза", "Дымность выхлопа", "Компрессия", "Эндоскопия цилиндров", "Цепь или ремень ГРМ", "Адаптации и рывки АКПП", "Ошибки блока двигателя"],
    chassis: ["Осмотр на подъёмнике", "Люфты рулевого управления", "Сайлентблоки и шаровые", "Ступичные подшипники", "Амортизаторы и пружины", "Пыльники и ШРУСы", "Диски, колодки, суппорты", "Тормозные шланги и трубки"],
    electronics: ["Сканирование всех блоков", "Активные и сохранённые ошибки", "Пробег в блоках управления", "SRS и подушки безопасности", "Работа датчиков и камер", "Электрика салона", "Мультимедиа и помощники", "Параметры в реальном времени"],
    interior: ["Износ руля и педалей", "Износ сидений и обшивки", "Следы затопления", "Запах и состояние салона", "Комплектность и ключи", "Работа всех кнопок", "Обогревы и климат", "Ремни и механизмы"],
    legal: ["Сверка VIN", "Техпаспорт и документы", "Залоги и ограничения", "Розыск", "Таможенное оформление", "Техосмотр и ОСАГО", "Количество владельцев", "История регистраций"],
  };
  const criticalCategories = new Set(["body", "engine", "interior", "legal"]);
  if (await prisma.autoPodborCheckItem.count() === 0) {
    let order = 0;
    for (const [category, items] of Object.entries(checks)) {
      for (const title of items) {
        order += 1;
        await prisma.autoPodborCheckItem.create({
          data: {
            category,
            title,
            sortOrder: order,
            isCritical: criticalCategories.has(category) && (title.includes("VIN") || title.includes("Свар") || title.includes("Пробег") || title.includes("Залог") || title.includes("ДТП")),
            isActive: true,
          },
        });
      }
    }
    console.log("  Автоподбор: проверки (48)");
  }

  /* faq */
  const faq: [string, string][] = [
    ["Чем автоподбор отличается от проверки на СТО?", "На СТО проверяют технику на подъёмнике, но не оценивают кузов, историю, документы и адекватность цены. Мы смотрим автомобиль целиком: ЛКП, геометрию, электронику, пробег, юридическую чистоту — и даём вердикт, стоит ли его покупать."],
    ["Сколько стоит автоподбор и от чего зависит цена?", "Разовый осмотр — от 150 BYN, эксперт на день — 550 BYN, подбор под ключ — от 1 200 BYN. Цена зависит от формата, города и сложности задачи. Точную стоимость фиксируем в договоре до начала работы."],
    ["Сколько времени занимает подбор?", "Разовый осмотр — 2–3 часа. Эксперт на день — до 8 часов. Подбор под ключ — от нескольких дней до нескольких недель: срок зависит от бюджета, модели и требований."],
    ["Можно ли проверить авто без моего присутствия?", "Да. Мы приезжаем на осмотр, снимаем фото и видео, делаем замеры и отправляем отчёт в Telegram или WhatsApp. Решение принимаете вы — мы даём факты и рекомендации."],
    ["Вы работаете с автосалонами и перекупщиками?", "Мы работаем на покупателя и не продаём автомобили. С продавцами общаемся как ваши представители — наша задача найти честный вариант, а не закрыть сделку любой ценой."],
    ["Даёте ли гарантию на подобранный автомобиль?", "Да, условия гарантии фиксируются в договоре. Обычно это 30 дней на двигатель и КПП и юридическая чистота сделки. Гарантия не отменяет естественный износ, но покрывает то, что можно было выявить на осмотре."],
    ["Что будет, если вы не найдёте подходящий автомобиль?", "Продолжаем поиск по согласованным критериям или обсуждаем корректировку бюджета и требований. Условия работы «до результата» прописываем в договоре заранее."],
    ["Можно ли заказать проверку авто из Европы, США или Кореи?", "Да. Подбираем автомобиль на площадках и аукционах, проверяем историю и состояние, помогаем с документами, логистикой и растаможкой."],
    ["Как оплатить услуги?", "Наличными или переводом, по договору. Порядок оплаты зависит от формата: разовый осмотр — по факту, подбор — по этапам. Все условия фиксируем до начала работы."],
    ["Вы продаёте автомобили?", "Нет. Мы не автосалон и не перекупщики. Наш доход — оплата услуг, поэтому мы заинтересованы найти лучший вариант для вас, а не продать конкретную машину."],
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

  /* demo case (hidden) */
  const demo = await prisma.autoPodborCase.findUnique({ where: { slug: "demo-passat-b8" } });
  if (!demo) {
    await prisma.autoPodborCase.create({
      data: {
        slug: "demo-passat-b8",
        title: "DEMO — Volkswagen Passat B8",
        brand: "Volkswagen",
        model: "Passat B8",
        year: 2019,
        budget: 22000,
        purchasePrice: 20400,
        tradeAmount: 600,
        days: 7,
        city: "Минск",
        task: "Семейный автомобиль до $22 000, дизель, автомат.",
        found: "Passat B8 2.0 TDI, один владелец, подтверждённый пробег.",
        result: "Сторговали $600, покупатель забрал авто в тот же день.",
        isActive: false,
        sortOrder: 999,
      },
    });
  }
}
