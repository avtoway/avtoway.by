import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth.server";
import { SERVICES } from "@/shared/config/services";

interface MenuItem {
  label: string;
  icon: string;
  href?: string;
  perm?: string;
  badge?: number;
  children?: MenuItem[];
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false, menu: [] });

  const perms = user.permissions;

  const hasPerm = (p: string) => perms.some(x => x.startsWith(p));

  // Active services for submenu
  const activeServices = SERVICES.filter(s => s.isActive);
  const serviceChildren: MenuItem[] = activeServices.map(s => {
    const href = `/admin/${s.slug}`;
    return { label: s.title, icon: "grid", href };
  });

  const allItems: MenuItem[] = [
    { label: "Главная", icon: "home", href: "/admin" },
    { label: "Мой профиль", icon: "user", href: "/admin/profile" },
    {
      label: "Услуги",
      icon: "grid",
      children: [
        { label: "Все услуги", icon: "settings", href: "/admin/services" },
        ...serviceChildren,
      ],
    },
    { label: "Партнёры", icon: "handshake", href: "/admin/partners", perm: "partners." },
    { label: "Сотрудники", icon: "users", href: "/admin/users", perm: "users.manage" },
    { label: "Роли", icon: "lock", href: "/admin/roles", perm: "users.roles" },
    { label: "Аудит", icon: "document-text", href: "/admin/audit-logs", perm: "audit.view" },
  ];

  // Filter by permissions recursively
  function filterItems(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => !item.perm || hasPerm(item.perm))
      .map(item => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined,
      }))
      .filter(item => !item.children || item.children.length > 0);
  }

  return NextResponse.json({ ok: true, menu: filterItems(allItems) });
}
