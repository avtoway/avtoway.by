import Link from "next/link";
import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";

async function getServices() {
  try {
    const repo = container.get<ServiceRepository>("ServiceRepository");
    return await repo.getActive();
  } catch { return []; }
}

export default async function MainNav() {
  const services = await getServices();

  return (
    <nav className="animate-nav flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-base font-medium backdrop-blur-sm sm:gap-3 sm:px-4">
      <Link href="/" className="animate-nav-item group relative cursor-pointer rounded-full px-4 py-2 text-zinc-400 no-underline transition-all duration-300 hover:text-white" style={{ animationDelay: "0.05s" }}>
        Главная
        <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
      </Link>

      {/* Services dropdown */}
      <span className="group relative" style={{ animationDelay: "0.1s" }}>
        <span className="animate-nav-item flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-zinc-400 transition-all duration-300 hover:text-white">
          Услуги
          <svg className="size-3 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
        </span>
        {services.length > 0 && (
          <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl">
              {services.map(s => (
                <Link key={s.slug} href={s.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md text-xs" style={{ backgroundColor: s.color + "20", color: s.color }}>
                    {ICON_MAP[s.iconName] ?? "⚙"}
                  </span>
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </span>

      <Link href="/about" className="animate-nav-item group relative cursor-pointer rounded-full px-4 py-2 text-zinc-400 no-underline transition-all duration-300 hover:text-white" style={{ animationDelay: "0.15s" }}>
        О нас
        <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
      </Link>

      <Link href="/partners" className="animate-nav-item group relative cursor-pointer rounded-full px-4 py-2 text-zinc-400 no-underline transition-all duration-300 hover:text-white" style={{ animationDelay: "0.2s" }}>
        Партнёры
        <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
      </Link>

      <Link href="/contacts" className="animate-nav-item group relative cursor-pointer rounded-full px-4 py-2 text-zinc-400 no-underline transition-all duration-300 hover:text-white" style={{ animationDelay: "0.25s" }}>
        Контакты
        <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
      </Link>
    </nav>
  );
}

const ICON_MAP: Record<string, string> = { youtube: "▶", car: "🚗", "check-circle": "✓", dollar: "$" };
