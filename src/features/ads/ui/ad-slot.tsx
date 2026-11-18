"use client";

import { useEffect, useState } from "react";
import AdImpression from "@/features/ads/ui/ad-impression";

interface PublicSlot {
  id: string;
  key: string;
  title: string;
  html?: string;
  imageUrl?: string;
  targetUrl?: string;
  height: number;
}

/**
 * Рекламный блок, управляемый из /admin/promotion.
 * Загружается на клиенте, поэтому страницы остаются статическими,
 * а изменения в админке видны сразу после обновления.
 */
export default function AdSlotBlock({
  slotKey,
  className = "",
}: {
  slotKey: string;
  className?: string;
}) {
  const [slot, setSlot] = useState<PublicSlot | null>(null);
  const [consent, setConsent] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        setConsent(localStorage.getItem("avtoway:cookie-consent"));
      } catch {
        setConsent(null);
      }
    };
    read();
    window.addEventListener("avtoway:cookie-consent", read);
    return () => window.removeEventListener("avtoway:cookie-consent", read);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ads/slot/${slotKey}`, { cache: "no-store" })
      .then(response => response.json())
      .then(json => {
        if (!cancelled && json.ok && json.data) setSlot(json.data as PublicSlot);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slotKey]);

  if (!slot) return null;

  // Сторонние рекламные скрипты показываем только после согласия на cookie.
  if (slot.html && consent !== "accepted") return null;

  return (
    <aside className={`mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 ${className}`} aria-label="Реклама">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-950">
        <span className="absolute left-2 top-2 z-10 rounded bg-zinc-900/90 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-zinc-500">
          Реклама
        </span>

        {slot.html ? (
          <iframe
            title={slot.title}
            srcDoc={slot.html}
            height={slot.height}
            className="block w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
          />
        ) : slot.imageUrl ? (
          <a
            href={`/api/ads/click/${slot.id}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block transition hover:opacity-90"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- внешние креативы рекламодателей */}
            <img
              src={slot.imageUrl}
              alt={slot.title}
              className="block w-full object-cover"
              style={{ maxHeight: slot.height }}
            />
          </a>
        ) : slot.targetUrl ? (
          <a
            href={`/api/ads/click/${slot.id}`}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex min-h-24 items-center justify-center px-4 py-8 text-center text-sm text-zinc-300 transition hover:text-white"
          >
            {slot.title}
          </a>
        ) : null}

        <AdImpression slotId={slot.id} />
      </div>
    </aside>
  );
}
