"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "avtoway:cookie-consent";
const EVENT = "avtoway:cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
      } catch {
        // Приватный режим: показываем баннер, выбор не сохранится.
        setVisible(true);
      }
    });
  }, []);

  function decide(value: "accepted" | "necessary") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(EVENT));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-zinc-400">
          Мы используем cookie для корректной работы сайта и анонимной аналитики.
          Подробнее — в{" "}
          <Link href="/privacy" className="underline transition hover:text-white">
            политике обработки данных
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide("necessary")}
            className="rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Только необходимые
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-white transition hover:bg-primary-dark"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
