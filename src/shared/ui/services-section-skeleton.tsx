export default function ServicesSectionSkeleton() {
  return (
    <section className="relative border-t border-zinc-800/50 bg-zinc-950 py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <div className="mx-auto h-8 w-48 animate-pulse rounded-full bg-zinc-800" />
        </div>
        <div className="flex justify-center gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-72 w-[340px] animate-pulse rounded-2xl bg-zinc-800/50"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
