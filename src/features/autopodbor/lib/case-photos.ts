import type { AutoPodborCase } from "@/entities/autopodbor/autopodbor.types";

/** Кейсы хранят фото строкой: JSON-массив или CSV. Поддерживаем оба формата. */
export function parseCasePhotos(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
    }
  } catch {
    // не JSON — обрабатываем как CSV
  }
  return value.split(",").map(item => item.trim()).filter(Boolean);
}

export function casePhotos(item: AutoPodborCase): string[] {
  return [item.mainPhoto, ...parseCasePhotos(item.photos)].filter((photo): photo is string => Boolean(photo));
}
