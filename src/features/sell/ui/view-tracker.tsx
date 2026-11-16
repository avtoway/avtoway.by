"use client";

import { useEffect } from "react";

/**
 * Счётчик просмотров карточки авто.
 * Вынесен из серверного рендера: не блокирует SQLite и не накручивается при prefetch.
 */
export default function SaleViewTracker({ carId }: { carId: string }) {
  useEffect(() => {
    const key = `avtoway:viewed:sell:${carId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Приватный режим — просто отправляем запрос.
    }
    void fetch(`/api/sell/${carId}/view`, { method: "POST" }).catch(() => undefined);
  }, [carId]);

  return null;
}
