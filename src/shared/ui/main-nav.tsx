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
    <nav className="flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-base font-medium backdrop-blur-sm sm:gap-3 sm:px-4">
      {NAV_ITEMS.map(item => {
        const active = isActive(item.href, (item as any).end);

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
  );
}
