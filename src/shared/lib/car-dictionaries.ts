export const TRANSMISSION_LABEL: Record<string, string> = {
  auto: "Автомат",
  manual: "Механика",
  robot: "Робот",
  variator: "Вариатор",
};

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
