"use client";

import Link from "next/link";

interface MenuItem {
  label: string;
  icon: string;
  href?: string;
  perm?: string;
  badge?: number;
  children?: MenuItem[];
}

const FALLBACK: Record<string, string> = {
  "/admin": "Главная",
  "/admin/profile": "Мой профиль",
  "/admin/services": "Услуги",
  "/admin/partners": "Партнёры",
  "/admin/users": "Сотрудники",
  "/admin/roles": "Роли",
  "/admin/audit-logs": "Аудит",
  "/admin/rent": "Аренда",
  "/admin/sell": "Продажа",
  "/admin/inspection": "Автоподбор",
  "/admin/truck": "Эвакуатор",
  "/admin/import": "Автопригон",
  "/admin/service": "Автосервис",
};

function getLabel(path: string, items: MenuItem[]): string | null {
  for (const item of items) {
    if (item.href === path) return item.label;
    if (item.children) {
      const found = getLabel(path, item.children);
      if (found) return found;
    }
  }
  return FALLBACK[path] ?? null;
}

export default function Breadcrumbs({
  pathname,
  items,
}: {
  pathname: string;
  items: MenuItem[];
}) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [];
  let current = "";

  for (const seg of segments) {
    current += `/${seg}`;
    if (current === pathname) {
      const label = getLabel(current, items);
      if (label) crumbs.push({ href: current, label });
    } else {
      const label = getLabel(current, items);
      if (label) crumbs.push({ href: current, label });
    }
  }

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500">
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg className="h-3 w-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          )}
          {i === crumbs.length - 1 ? (
            <span className="text-slate-400">{c.label}</span>
          ) : (
            <Link href={c.href} className="transition hover:text-slate-300">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
