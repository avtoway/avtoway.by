/**
 * Ориентировочные ставки для предварительного расчёта.
 * Значения намеренно вынесены в один файл: при изменении законодательства
 * достаточно поправить таблицу, не трогая UI.
 */
export const EUR_TO_BYN = 3.3;

export type EngineType = "petrol" | "diesel" | "electric";
export type CarAge = "under3" | "from3to5" | "over5";

export const ENGINE_LABEL: Record<EngineType, string> = {
  petrol: "Бензин",
  diesel: "Дизель",
  electric: "Электро",
};

export const AGE_LABEL: Record<CarAge, string> = {
  under3: "До 3 лет",
  from3to5: "От 3 до 5 лет",
  over5: "Старше 5 лет",
};

/** Пошлина: либо процент от стоимости, либо ставка за см³ (EUR). */
const DUTY: Record<CarAge, Record<EngineType, { percent?: number; perCm3?: number }>> = {
  under3: {
    petrol: { percent: 0.48 },
    diesel: { percent: 0.48 },
    electric: { percent: 0.15 },
  },
  from3to5: {
    petrol: { perCm3: 1.5 },
    diesel: { perCm3: 2.0 },
    electric: { percent: 0.15 },
  },
  over5: {
    petrol: { perCm3: 3.0 },
    diesel: { perCm3: 3.5 },
    electric: { percent: 0.15 },
  },
};

/** Утильсбор для физлица, BYN (ориентир). */
const UTIL_FEE_BYN: Record<CarAge, number> = {
  under3: 1000,
  from3to5: 2000,
  over5: 3000,
};

/** Таможенный сбор за оформление, BYN (ориентир). */
export const CUSTOMS_FEE_BYN = 120;

export interface CustomsInput {
  engine: EngineType;
  age: CarAge;
  volumeCm3: number;
  priceEur: number;
  discount140: boolean;
}

export interface CustomsResult {
  dutyEur: number;
  dutyByn: number;
  utilByn: number;
  feeByn: number;
  totalByn: number;
}

export function calculateCustoms(input: CustomsInput): CustomsResult {
  const rate = DUTY[input.age][input.engine];
  let dutyEur = 0;

  if (rate.percent) {
    dutyEur = Math.max(0, input.priceEur) * rate.percent;
  } else if (rate.perCm3) {
    dutyEur = Math.max(0, input.volumeCm3) * rate.perCm3;
  }

  // Льгота по Указу №140 — скидка 50% на таможенную пошлину.
  if (input.discount140) dutyEur *= 0.5;

  const dutyByn = Math.round(dutyEur * EUR_TO_BYN);
  const utilByn = UTIL_FEE_BYN[input.age];
  const feeByn = CUSTOMS_FEE_BYN;

  return {
    dutyEur: Math.round(dutyEur),
    dutyByn,
    utilByn,
    feeByn,
    totalByn: dutyByn + utilByn + feeByn,
  };
}
