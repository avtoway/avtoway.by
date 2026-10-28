export default function InspectionLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-28">
      <div className="mx-auto max-w-3xl animate-pulse px-6 text-center">
        <div className="mx-auto h-4 w-48 rounded bg-zinc-800" />
        <div className="mx-auto mt-6 h-10 w-full max-w-xl rounded bg-zinc-800" />
        <div className="mx-auto mt-3 h-10 w-4/5 max-w-lg rounded bg-zinc-800" />
        <div className="mx-auto mt-6 h-4 w-full max-w-md rounded bg-zinc-800/70" />
        <div className="mx-auto mt-3 h-4 w-3/4 max-w-sm rounded bg-zinc-800/70" />
        <div className="mx-auto mt-8 flex justify-center gap-3">
          <div className="h-12 w-40 rounded-full bg-zinc-800" />
          <div className="h-12 w-32 rounded-full bg-zinc-800/70" />
        </div>
        <div className="mx-auto mt-6 flex flex-wrap justify-center gap-2">
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="h-6 w-24 rounded-full bg-zinc-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
