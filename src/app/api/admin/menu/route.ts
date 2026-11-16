import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";
import { ANY_LEAD_ACCESS_PERMISSIONS } from "@/entities/crm/crm.access";

/** Заявки/клиенты/задачи доступны при любом праве на работу с лидами. */
const LEAD_ACCESS_PERMS = ANY_LEAD_ACCESS_PERMISSIONS;

interface MenuItem {
  label: string;
  icon: string;
  href?: string;
  perm?: string;
  /** Доступ, если есть хотя бы одно из прав. */
  anyPerm?: string[];
  badge?: number;
  children?: MenuItem[];
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ok: false, menu: [] });

  const perms = user.permissions;
  const hasPerm = (p: string) => perms.some(x => x.startsWith(p));

  // Services from DB (single source of truth). Only "rent" has a dedicated
  // admin module; other services are managed via the "Все услуги" page.
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const services = await serviceRepo.getActive();

  const serviceChildren: MenuItem[] = [];
  if (services.some(s => s.slug === "rent")) {
    serviceChildren.push({ label: "Аренда", icon: "grid", href: "/admin/rent", perm: "rent.manage" });
    serviceChildren.push({ label: "Калькулятор аренды", icon: "calculator", href: "/admin/rent/calculator", perm: "rent.manage" });
  }

  let newSaleRequests = 0;
  if (perms.some(p => p.startsWith("sell."))) {
    try {
      const saleRepo = container.get<SaleCarRepository>("SaleCarRepository");
      newSaleRequests = await saleRepo.countNewRequests();
    } catch { /* таблица ещё не создана — не ломаем меню */ }
  }

  let newAutoPodborLeads = 0;
  if (perms.some(p => p.startsWith("autopodbor."))) {
    try {
      const autoRepo = container.get<AutoPodborRepository>("AutoPodborRepository");
      newAutoPodborLeads = await autoRepo.countNewLeads();
    } catch { /* таблица ещё не создана — не ломаем меню */ }
  }

  const allItems: MenuItem[] = [
    { label: "Главная", icon: "home", href: "/admin" },
    { label: "Мой профиль", icon: "user", href: "/admin/profile" },
    {
      label: "Услуги",
      icon: "grid",
      perm: "services.",
      children: [
        { label: "Все услуги", icon: "settings", href: "/admin/services", perm: "services.manage" },
        { label: "Контент лендингов", icon: "document-text", href: "/admin/landings", perm: "services.manage" },
        ...serviceChildren,
        { label: "Продажа авто", icon: "dollar", href: "/admin/sell", perm: "sell.manage", badge: newSaleRequests || undefined },
      ],
    },
    { label: "Партнёры", icon: "handshake", href: "/admin/partners", perm: "partners." },
    { label: "Вакансии", icon: "briefcase", href: "/admin/vacancies", perm: "vacancies." },
    { label: "Автоподбор", icon: "search", href: "/admin/inspection", perm: "autopodbor.", badge: newAutoPodborLeads || undefined },
    { label: "Контакты", icon: "phone", href: "/admin/contacts", perm: "contacts.manage" },
    { label: "Заявки", icon: "document-text", href: "/admin/requests", anyPerm: LEAD_ACCESS_PERMS },
    { label: "Клиенты", icon: "users", href: "/admin/clients", anyPerm: LEAD_ACCESS_PERMS },
    { label: "Задачи", icon: "document-text", href: "/admin/tasks", anyPerm: LEAD_ACCESS_PERMS },
    { label: "Уведомления", icon: "bell", href: "/admin/notifications", perm: "audit.view" },
    { label: "Аналитика", icon: "chart", href: "/admin/analytics", perm: "audit.view" },
    { label: "Почта", icon: "mail", href: "/admin/email", perm: "email.manage" },
    { label: "Сотрудники", icon: "users", href: "/admin/users", perm: "users.manage" },
    { label: "Роли", icon: "lock", href: "/admin/roles", perm: "users.roles" },
    { label: "Аудит", icon: "document-text", href: "/admin/audit-logs", perm: "audit.view" },
    { label: "Мониторинг", icon: "settings", href: "/admin/monitoring", perm: "audit.view" },
  ];

  // Filter by permissions recursively
  function filterItems(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => !item.perm || hasPerm(item.perm))
      .filter(item => !item.anyPerm || item.anyPerm.some(permission => perms.includes(permission)))
      .map(item => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined,
      }))
      .filter(item => !item.children || item.children.length > 0);
  }

  return NextResponse.json({ ok: true, menu: filterItems(allItems) });
}
