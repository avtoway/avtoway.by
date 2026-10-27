export const TRANSMISSION_LABEL: Record<string, string> = {
  auto: "Автомат",
  manual: "Механика",
  robot: "Робот",
  variator: "Вариатор",
};

/** Пользовательские названия типов аренды (slug → подпись) */
export const RENT_TYPE_LABEL: Record<string, string> = {
  rent: "Для личных целей",
  taxi: "Под такси",
};

export function rentTypeLabel(slug?: string | null, fallback?: string | null): string {
  return (slug && RENT_TYPE_LABEL[slug]) || fallback || "";
}

export const FUEL_LABEL: Record<string, string> = {
  gasoline: "Бензин",
  "gas-propane": "Бензин (пропан-бутан)",
  "gas-methane": "Бензин (метан)",
  "gas-hybrid": "Бензин (гибрид)",
  diesel: "Дизель",
  "diesel-hybrid": "Дизель (гибрид)",
  electric: "Электро",
  hybrid: "Гибрид",
  propane: "Газ",
  methane: "Метан",
};

export function transmissionLabel(value?: string | null): string | undefined {
  return value ? (TRANSMISSION_LABEL[value] ?? value) : undefined;
}

export function fuelLabel(value?: string | null): string | undefined {
  return value ? (FUEL_LABEL[value] ?? value) : undefined;
}
