import Link from "next/link";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70dvh] items-center justify-center overflow-hidden bg-zinc-950 px-6 py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(239,68,68,0.10),transparent_70%)]" />

      <div className="relative mx-auto max-w-xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-400">Ошибка 404</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Страница не найдена
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-zinc-400">
          Возможно, ссылка устарела или услуга временно скрыта. Попробуйте начать с главной страницы.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark active:scale-95"
          >
            На главную
          </Link>
          <Link
            href="/services"
            className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-700 bg-white/5 px-7 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white active:scale-95"
          >
            Все услуги
          </Link>
        </div>
      </div>
    </section>
  );
}
