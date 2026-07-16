"use client";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h2 className="text-3xl font-bold text-white">Упс! Что-то пошло не так</h2>
      <p className="max-w-md text-zinc-400">
        {error.message || "Не удалось загрузить страницу. Попробуйте снова."}
      </p>
      <button
        onClick={reset}
        className="inline-flex h-12 items-center rounded-full bg-primary px-8 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark"
      >
        Попробовать снова
      </button>
    </section>
  );
}
