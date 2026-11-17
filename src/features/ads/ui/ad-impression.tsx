"use client";

import { useEffect } from "react";

/** Один показ на слот за сессию: не засоряем БД повторными запросами. */
export default function AdImpression({ slotId }: { slotId: string }) {
  useEffect(() => {
    const key = `ad-impression:${slotId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // приватный режим — просто отправляем
    }
    void fetch(`/api/ads/impression/${slotId}`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slotId]);

  return null;
}
