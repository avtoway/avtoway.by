"use client";

import Link from "next/link";

const items = [
  { label: "Главная", href: "/" },
  { label: "Услуги", href: "", hasArrow: true },
  { label: "О нас", href: "#about" },
  { label: "Партнёры", href: "" },
  { label: "Контакты", href: "" },
];

export default function MainNav() {
  const handleClick = (href: string) => {
    if (href === "/") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="animate-nav flex items-center gap-1 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1.5 text-base font-medium backdrop-blur-sm sm:gap-3 sm:px-4">
      {items.map((item, i) => {
        const delay = `${(i + 1) * 0.05}s`;
        const shared =
          "animate-nav-item group relative cursor-pointer rounded-full px-4 py-2 text-zinc-400 transition-all duration-300 hover:text-white";

        if (item.href === "/") {
          return (
            <Link
              key={item.label}
              href="/"
              onClick={() => handleClick("/")}
              className={`${shared} no-underline`}
              style={{ animationDelay: delay }}
            >
              {item.label}
              <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          );
        }

        if (item.hasArrow) {
          return (
            <span
              key={item.label}
              className={`${shared} flex items-center gap-1.5`}
              style={{ animationDelay: delay }}
            >
              {item.label}
              <svg className="size-3 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </span>
          );
        }

        return (
          <span
            key={item.label}
            className={shared}
            style={{ animationDelay: delay }}
          >
            {item.label}
            <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
          </span>
        );
      })}
    </nav>
  );
}
