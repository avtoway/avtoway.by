"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <section className="flex min-h-[70dvh] items-center justify-center bg-zinc-950 px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-400">Ошибка</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Что-то пошло не так</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Страница не загрузилась. Попробуйте обновить — если ошибка повторится, позвоните нам.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Попробовать снова
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-700 px-6 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            На главную
          </Link>
        </div>
      </div>
    </section>
  );
}
