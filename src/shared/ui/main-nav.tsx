"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Service } from "@/entities/service/service.types";

export type NavService = Pick<Service, "slug" | "title" | "href">;

const NAV_ITEMS = [
  { label: "Главная", href: "/", end: true },
  { label: "Услуги", href: "/services" },
  { label: "О нас", href: "/about" },
  { label: "Партнёры", href: "/partners" },
  { label: "Контакты", href: "/contacts" },
];

function Chevron({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    >
      <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MainNav({ services: initialServices }: { services: NavService[] }) {
  const pathname = usePathname();
  const [services, setServices] = useState<NavService[]>(initialServices);
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  // Список в шапке живёт отдельно от админки, поэтому обновляем его
  // при переходе и при возврате на вкладку — без перезагрузки страницы.
  useEffect(() => {
    let cancelled = false;

    async function refreshServices() {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const json = await res.json();
        if (cancelled || !json.ok) return;
        setServices(
          (json.data as Service[])
            .filter((service) => service.isActive)
            .map(({ slug, title, href }) => ({ slug, title, href })),
        );
      } catch {
        // Если запрос не удался, оставляем серверный список.
      }
    }

    void refreshServices();

    const onFocus = () => void refreshServices();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  const isActive = (href: string, end?: boolean) => {
    if (end) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
  };

  return (
    <>
      <nav className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-base font-medium backdrop-blur-sm md:flex md:gap-3 md:px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, (item as { end?: boolean }).end);

          if (item.href === "/services") {
            const hasServices = services.length > 0;

            return (
              <span
                key={item.href}
                className="group relative"
                onMouseEnter={() => {
                  if (hasServices) setDesktopServicesOpen(true);
                }}
                onMouseLeave={() => setDesktopServicesOpen(false)}
                onFocusCapture={() => {
                  if (hasServices) setDesktopServicesOpen(true);
                }}
                onBlurCapture={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDesktopServicesOpen(false);
                  }
                }}
              >
                <Link
                  href="/services"
                  aria-haspopup={hasServices ? "true" : undefined}
                  aria-expanded={hasServices ? desktopServicesOpen : undefined}
                  aria-controls={hasServices ? "desktop-services" : undefined}
                  onClick={(event) => {
                    event.currentTarget.blur();
                    setDesktopServicesOpen(false);
                  }}
                  className={`group/link relative flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 no-underline transition-all duration-300 ${
                    active ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {hasServices && <Chevron />}
                  <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover/link:scale-x-100" />
                  {active && <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary" />}
                </Link>

                {hasServices && (
                  <div
                    id="desktop-services"
                    className={`absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-2 transition-all duration-200 ${
                      desktopServicesOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                      <div className="max-h-[min(60vh,360px)] overflow-y-auto">
                        {services.map((service) => (
                          <Link
                            key={service.slug}
                            href={service.href}
                            onClick={(event) => {
                              event.currentTarget.blur();
                              setDesktopServicesOpen(false);
                            }}
                            className={`group/item flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                              pathname === service.href
                                ? "bg-zinc-800 text-white"
                                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                            }`}
                          >
                            <span>{service.title}</span>
                            <span className="translate-x-0 text-zinc-600 transition-all group-hover/item:translate-x-0.5 group-hover/item:text-primary">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        href="/services"
                        onClick={(event) => {
                          event.currentTarget.blur();
                          setDesktopServicesOpen(false);
                        }}
                        className="mt-1 flex items-center justify-between rounded-lg border-t border-zinc-800/80 px-3 py-2.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
                      >
                        Все услуги
                        <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  </div>
                )}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative cursor-pointer rounded-full px-4 py-2 no-underline transition-all duration-300 ${
                active ? "text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
              <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
              {active && <span className="absolute inset-x-3 bottom-1 h-0.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => {
          if (mobileOpen) closeMobile();
          else setMobileOpen(true);
        }}
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
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, (item as { end?: boolean }).end);
              const hasServices = item.href === "/services" && services.length > 0;

              return (
                <div key={item.href}>
                  <div className="flex items-center gap-1">
                    <Link
                      href={item.href}
                      onClick={closeMobile}
                      className={`flex-1 rounded-lg px-3 py-2.5 text-sm transition ${
                        active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                    {hasServices && (
                      <button
                        type="button"
                        onClick={() => setMobileServicesOpen((open) => !open)}
                        aria-label={mobileServicesOpen ? "Свернуть список услуг" : "Показать список услуг"}
                        aria-expanded={mobileServicesOpen}
                        aria-controls="mobile-services"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
                      >
                        <Chevron open={mobileServicesOpen} />
                      </button>
                    )}
                  </div>

                  {hasServices && mobileServicesOpen && (
                    <div id="mobile-services" className="ml-3 border-l border-zinc-800 pl-3">
                      {services.map((service) => (
                        <Link
                          key={service.slug}
                          href={service.href}
                          onClick={closeMobile}
                          className={`block rounded-lg px-3 py-2 text-sm transition ${
                            pathname === service.href
                              ? "text-white"
                              : "text-zinc-500 hover:text-white"
                          }`}
                        >
                          {service.title}
                        </Link>
                      ))}
                      <Link
                        href="/services"
                        onClick={closeMobile}
                        className="mt-1 block rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 transition hover:text-white"
                      >
                        Все услуги →
                      </Link>
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
