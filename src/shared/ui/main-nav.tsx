"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Service } from "@/entities/service/service.types";

const NAV_ITEMS = [
  { label: "Главная", href: "/", end: true },
  { label: "Услуги", href: "/services" },
  { label: "О нас", href: "/about" },
  { label: "Партнёры", href: "/partners" },
  { label: "Контакты", href: "/contacts" },
];

export default function MainNav() {
  const pathname = usePathname();
  const [services, setServices] = useState<Service[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/services").then(r => r.json()).then(json => {
      if (json.ok) setServices(json.data.filter((s: Service) => s.isActive));
    }).catch(() => {});
  }, []);

  const isActive = (href: string, end?: boolean) => {
    if (end) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <nav className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-base font-medium backdrop-blur-sm md:flex md:gap-3 md:px-4">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href, (item as { end?: boolean }).end);

          if (item.href === "/services") {
            return (
              <span key={item.href} className="group relative">
                <Link href="/services"
                  className={`group/link relative cursor-pointer rounded-full px-4 py-2 no-underline transition-all duration-300 ${
                    active ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}>
                  {item.label}
                  <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover/link:scale-x-100" />
                  {active && <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary" />}
                </Link>
                {services.length > 0 && (
                  <div className="invisible absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-xl">
                      {services.map(s => (
                        <Link key={s.slug} href={s.href}
                          className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                            pathname === s.href ? "text-white bg-zinc-800" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                          }`}>
                          {s.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </span>
            );
          }

          return (
            <Link key={item.href} href={item.href}
              className={`group relative cursor-pointer rounded-full px-4 py-2 no-underline transition-all duration-300 ${
                active ? "text-white" : "text-zinc-400 hover:text-white"
              }`}>
              {item.label}
              <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              {active && <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => setMobileOpen(open => !open)}
        aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition hover:text-white md:hidden"
      >
        <span className="relative block h-4 w-5" aria-hidden="true">
          <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-current transition-transform ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
          <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded bg-current transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-current transition-transform ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
        </span>
      </button>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Мобильная навигация"
          className="absolute left-0 right-0 top-full border-b border-white/10 bg-zinc-950/95 px-4 py-4 backdrop-blur-xl md:hidden"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {NAV_ITEMS.map(item => {
              const active = isActive(item.href, (item as { end?: boolean }).end);
              return (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                      active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.href === "/services" && services.length > 0 && (
                    <div className="ml-3 border-l border-zinc-800 pl-3">
                      {services.map(service => (
                        <Link
                          key={service.slug}
                          href={service.href}
                          onClick={() => setMobileOpen(false)}
                          className={`block rounded-lg px-3 py-2 text-sm transition ${
                            pathname === service.href
                              ? "text-white"
                              : "text-zinc-500 hover:text-white"
                          }`}
                        >
                          {service.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}
