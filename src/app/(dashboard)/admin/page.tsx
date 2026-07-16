"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashData {
  user: { name: string; role: string; permissions: string[] };
  userCount: number;
  serviceCount: number;
  partnerCount: number;
  recentLogs: { id: string; action: string; entity: string; entityId: string; created_at: string }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me").then(r => r.json());
      if (!me.ok) { router.push("/admin/login"); return; }
      const safeJson = (r: Response): Promise<any> => r.json().catch(() => ({ ok: false }));
      const [uRes, sRes, pRes, lRes] = await Promise.all([
        fetch("/api/users").then(safeJson),
        fetch("/api/services").then(safeJson),
        fetch("/api/partners").then(safeJson),
        fetch("/api/audit-logs").then(safeJson),
      ]);
      setData({
        user: me.data,
        userCount: uRes.ok ? uRes.data.length : 0,
        serviceCount: sRes.ok ? sRes.data.length : 0,
        partnerCount: pRes.ok ? pRes.data.length : 0,
        recentLogs: lRes.ok ? lRes.data.slice(0, 5) : [],
      });
    })();
  }, [router]);

  if (!data) return <p className="pt-20 text-center text-zinc-500">Загрузка...</p>;

  const hasPerm = (perm: string) => data.user.permissions?.includes(perm) ?? false;

  const quickActions = [
    { href: "/admin/profile", label: "Мой профиль", desc: "Редактировать личные данные", show: true, color: "border-red-800/40 hover:border-red-600" },
    { href: "/admin/users", label: "Сотрудники", desc: "Управление пользователями", show: hasPerm("users.manage"), color: "border-blue-800/40 hover:border-blue-600" },
    { href: "/admin/roles", label: "Роли и доступы", desc: "Настройка ролей и прав", show: hasPerm("users.roles"), color: "border-purple-800/40 hover:border-purple-600" },
    { href: "/admin/services", label: "Услуги", desc: "Список и редактирование услуг", show: hasPerm("services.manage"), color: "border-green-800/40 hover:border-green-600" },
    { href: "/admin/partners", label: "Партнёры", desc: "Управление партнёрами", show: hasPerm("partners.manage"), color: "border-amber-800/40 hover:border-amber-600" },
    { href: "/admin/audit-logs", label: "Аудит", desc: "Журнал действий", show: hasPerm("audit.view"), color: "border-zinc-700 hover:border-zinc-500" },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">С возвращением, {data.user.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {data.user.role} · {data.userCount} сотрудников, {data.serviceCount} услуг, {data.partnerCount} партнёров
        </p>
      </div>

      {/* Quick actions */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.filter(a => a.show).map(action => (
          <Link key={action.href} href={action.href}
            className={`rounded-xl border bg-zinc-900/50 p-5 transition-all ${action.color}`}>
            <h3 className="font-semibold">{action.label}</h3>
            <p className="mt-1 text-xs text-zinc-500">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Stats + Recent activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats cards */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-3xl font-bold text-white">{data.userCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Сотрудников</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-3xl font-bold text-white">{data.serviceCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Услуг</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-3xl font-bold text-white">{data.partnerCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Партнёров</p>
        </div>

        {/* Recent logs */}
        <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <h3 className="mb-3 text-sm font-semibold text-zinc-300">Последние действия</h3>
          {data.recentLogs.length === 0 ? (
            <p className="text-xs text-zinc-600">Нет записей</p>
          ) : (
            <div className="space-y-2">
              {data.recentLogs.map(log => (
                <div key={log.id} className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="w-16 shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 text-center text-[10px] font-medium uppercase text-zinc-400">
                    {log.action}
                  </span>
                  <span className="font-medium text-zinc-300">{log.entity}</span>
                  <span className="truncate text-zinc-600">{log.entityId}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
