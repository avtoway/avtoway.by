export default function InspectionLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-28">
      <div className="mx-auto max-w-6xl animate-pulse px-6">
        <div className="h-4 w-48 rounded bg-zinc-800" />
        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="h-3 w-40 rounded bg-zinc-800" />
            <div className="h-12 w-full rounded bg-zinc-800" />
            <div className="h-12 w-4/5 rounded bg-zinc-800" />
            <div className="h-4 w-full rounded bg-zinc-800/70" />
            <div className="h-4 w-3/4 rounded bg-zinc-800/70" />
            <div className="h-12 w-56 rounded-full bg-zinc-800" />
          </div>
          <div className="aspect-[4/3] rounded-2xl bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
