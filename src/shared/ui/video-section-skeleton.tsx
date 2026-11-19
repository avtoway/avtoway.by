export default function VideoSectionSkeleton() {
  return (
    <section className="relative overflow-hidden border-t border-zinc-800/50 bg-zinc-900/30 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 space-y-3">
          <div className="h-3 w-20 animate-pulse rounded-full bg-zinc-800" />
          <div className="h-8 w-56 animate-pulse rounded-full bg-zinc-800" />
        </div>
        <div className="flex gap-3.5">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-56 animate-pulse rounded-2xl bg-zinc-800/50 ${
                i === 1 ? "w-full" : "hidden w-[320px] md:block"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
