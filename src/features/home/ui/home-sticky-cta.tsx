"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Мобильная панель действий. Прячется, когда пользователь дошёл до формы заявки:
 * там те же кнопки уже есть, и панель только перекрывала бы поля.
 */
export default function HomeStickyCta({ phone }: { phone?: string }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("request");
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry) setHidden(entry.isIntersecting);
      },
      { rootMargin: "0px 0px -30% 0px", threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 pt-3 backdrop-blur transition-transform duration-300 lg:hidden ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-lg items-center gap-3">
        {phone ? (
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-sm font-medium text-white"
          >
            Позвонить
          </a>
        ) : null}
        <Link
          href="/contacts"
          className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
        >
          Оставить заявку
        </Link>
      </div>
    </div>
  );
}
