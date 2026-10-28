export const TRANSMISSION_LABEL: Record<string, string> = {
  auto: "Автомат",
  manual: "Механика",
  robot: "Робот",
  variator: "Вариатор",
};

export const FUEL_LABEL: Record<string, string> = {
  gasoline: "Бензин",
  "gas-propane": "Бензин / пропан-бутан",
  "gas-methane": "Бензин / метан",
  "gas-hybrid": "Бензин / гибрид",
  diesel: "Дизель",
  "diesel-hybrid": "Дизель / гибрид",
  electric: "Электро",
  hybrid: "Гибрид",
  propane: "Газ (пропан)",
  methane: "Газ (метан)",
};

/** Полный набор коробок передач для фильтра и админки. */
export const TRANSMISSION_OPTIONS = [
  { value: "auto", label: "Автомат" },
  { value: "manual", label: "Механика" },
  { value: "robot", label: "Робот" },
  { value: "variator", label: "Вариатор" },
] as const;

/** Группы топлива: показываем все варианты, даже если сейчас нет авто. */
export const FUEL_GROUPS = [
  { label: "Бензин", values: ["gasoline"] },
  { label: "Дизель", values: ["diesel"] },
  { label: "Газ", values: ["gas-propane", "gas-methane", "propane", "methane"] },
  { label: "Гибрид", values: ["gas-hybrid", "diesel-hybrid", "hybrid"] },
  { label: "Электро", values: ["electric"] },
] as const;

export const FUEL_OPTIONS = FUEL_GROUPS.flatMap(group => group.values);

export const BODY_TYPE_LABEL: Record<string, string> = {
  sedan: "Седан",
  wagon: "Универсал",
  hatchback: "Хэтчбек",
  liftback: "Лифтбек",
  suv: "Внедорожник / Кроссовер",
  coupe: "Купе",
  minivan: "Минивэн",
  pickup: "Пикап",
  van: "Микроавтобус",
};

export const DRIVE_TYPE_LABEL: Record<string, string> = {
  fwd: "Передний",
  rwd: "Задний",
  awd: "Полный (AWD)",
};

export const INTERIOR_MATERIAL_LABEL: Record<string, string> = {
  leather: "Натуральная кожа",
  "eco-leather": "Экокожа",
  fabric: "Ткань",
  alcantara: "Алькантара",
  combined: "Комбинированный",
};

export const INTERIOR_COLOR_LABEL: Record<string, string> = {
  dark: "Тёмный",
  light: "Светлый",
  brown: "Коричневый",
  combo: "Комбинированный",
};

export const SALE_STATUS_LABEL: Record<string, string> = {
  available: "В наличии",
  reserved: "В резерве",
  sold: "Продано",
  draft: "Черновик",
};

export const SALE_STATUS_STYLE: Record<string, string> = {
  available: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  reserved: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  sold: "border-zinc-600/40 bg-zinc-700/30 text-zinc-400",
  draft: "border-sky-500/30 bg-sky-500/10 text-sky-400",
};

export const SALE_CONDITION_LABEL: Record<string, string> = {
  used: "С пробегом",
  new: "Новый",
  damaged: "Аварийный",
};

export const SALE_REQUEST_TYPE_LABEL: Record<string, string> = {
  buy: "Покупка / осмотр",
  trade_in: "Обмен / Trade-in",
  sell_own: "Продать своё авто",
};

export const SALE_REQUEST_STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  rejected: "Отказ",
};

export const SALE_SORT_LABEL: Record<string, string> = {
  recommended: "По умолчанию (рекомендуемые)",
  fresh: "Сначала свежие",
  price_asc: "Сначала дешевле",
  price_desc: "Сначала дороже",
  mileage_asc: "Меньше пробег",
  year_desc: "Новее год",
};

export interface SaleFeatureGroup {
  title: string;
  items: string[];
}

/** Группы комплектации для карточки авто и чекбоксов в админке. */
export const SALE_FEATURE_GROUPS: SaleFeatureGroup[] = [
  {
    title: "Безопасность",
    items: [
      "ABS", "ESP", "Airbag водителя", "Airbag пассажира", "Боковые airbag",
      "Шторки безопасности", "Крепление ISOFIX", "Сигнализация", "Иммобилайзер",
      "Помощь при спуске", "Контроль слепых зон", "Адаптивный круиз-контроль",
    ],
  },
  {
    title: "Комфорт и климат",
    items: [
      "Климат-контроль", "Кондиционер", "Подогрев сидений", "Вентиляция сидений",
      "Подогрев руля", "Электропривод сидений", "Память сидений", "Круиз-контроль",
      "Бесключевой доступ", "Запуск с кнопки", "Электропривод багажника",
      "Панорамная крыша", "Люк",
    ],
  },
  {
    title: "Фары и обзор",
    items: [
      "Биксеноновые фары", "LED-фары", "Адаптивный свет", "Омыватель фар",
      "Датчик света", "Датчик дождя", "Электрохромное зеркало", "Камера заднего вида",
      "Передние парктроники", "Задние парктроники", "Камера 360°",
    ],
  },
  {
    title: "Салон",
    items: [
      "Кожаный салон", "Тканевый салон", "Алькантара", "Мультифункциональный руль",
      "Электростеклоподъёмники", "Центральный подлокотник", "Складывающиеся сиденья",
      "Столики для задних пассажиров", "Шторки на окнах",
    ],
  },
  {
    title: "Мультимедиа",
    items: [
      "Штатная магнитола", "Apple CarPlay", "Android Auto", "Bluetooth",
      "USB", "AUX", "Навигация", "Премиум-аудио", "Сабвуфер", "Цифровая приборная панель",
    ],
  },
  {
    title: "Экстерьер",
    items: [
      "Легкосплавные диски", "Литые диски", "Рейлинги", "Тонировка", "Фаркоп",
      "Спойлер", "Хромированные элементы", "Защита картера", "Брызговики",
    ],
  },
  {
    title: "Защита от угона",
    items: [
      "Спутниковая сигнализация", "Механический замок КПП", "Замок капота",
      "Маркировка стёкол", "Трекер", "Автозапуск",
    ],
  },
];

export const ALL_SALE_FEATURES = SALE_FEATURE_GROUPS.flatMap(g => g.items);

export function transmissionLabel(value?: string | null): string | undefined {
  return value ? (TRANSMISSION_LABEL[value] ?? value) : undefined;
}

export function fuelLabel(value?: string | null): string | undefined {
  return value ? (FUEL_LABEL[value] ?? value) : undefined;
}

export function bodyTypeLabel(value?: string | null): string | undefined {
  return value ? (BODY_TYPE_LABEL[value] ?? value) : undefined;
}

export function driveTypeLabel(value?: string | null): string | undefined {
  return value ? (DRIVE_TYPE_LABEL[value] ?? value) : undefined;
}

export function saleStatusLabel(value?: string | null): string {
  return value ? (SALE_STATUS_LABEL[value] ?? value) : "—";
}

export function saleFeatureGroups(features: string[]): Array<{ title: string; items: string[] }> {
  const selected = new Set(features);
  return SALE_FEATURE_GROUPS
    .map(group => ({ title: group.title, items: group.items.filter(item => selected.has(item)) }))
    .filter(group => group.items.length > 0);
}
