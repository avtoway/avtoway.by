import type { AutoPodborFeature } from "@/entities/autopodbor/autopodbor.types";
import AutoIcon from "./icon";

export default function TrustBar({ items }: { items: AutoPodborFeature[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-zinc-800/50 bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-2.5 text-sm text-zinc-400">
              <AutoIcon name={item.icon} className="h-5 w-5 shrink-0 text-primary" />
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
