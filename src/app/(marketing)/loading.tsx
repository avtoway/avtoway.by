export default function MarketingLoading() {
  return (
    <div className="min-h-[70dvh] bg-zinc-950 px-6 py-28">
      <div className="mx-auto max-w-6xl animate-pulse space-y-8">
        <div className="h-4 w-32 rounded-full bg-zinc-800" />
        <div className="h-12 w-2/3 rounded-2xl bg-zinc-800/80" />
        <div className="h-4 w-1/2 rounded-full bg-zinc-800/60" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-44 rounded-2xl border border-zinc-800 bg-zinc-900/40" />
          ))}
        </div>
      </div>
      <span className="sr-only">Загрузка страницы</span>
    </div>
  );
}
