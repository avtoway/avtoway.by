"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashLog {
  id: string; userId: string; action: string; entity: string; entityId: string;
  createdAt: string; userName?: string; userLogin?: string; details?: string | null;
}

interface DashData {
  user: { name: string; role: string; permissions: string[] };
  userCount: number;
  serviceCount: number;
  partnerCount: number;
  recentLogs: DashLog[];
}

const ACTION_LABEL: Record<string, string> = {
  CREATE: "создал(а)", UPDATE: "изменил(а)", DELETE: "удалил(а)",
};

const ENTITY_LABEL: Record<string, string> = {
  User: "пользователя", Role: "роль", Service: "услугу", Partner: "партнёра",
};

function describeLog(log: DashLog): string {
  const who = log.userName || log.userLogin || log.userId.slice(0, 8);
  const action = ACTION_LABEL[log.action] || log.action.toLowerCase();
  const entity = ENTITY_LABEL[log.entity] || log.entity.toLowerCase();

  if (log.details) {
    try {
      const d = JSON.parse(log.details);
      if (d.login && log.entity === "User") return `${who} создал(а) пользователя ${d.login}`;
      if (d.title) return `${who} ${action} «${d.title}»`;
      if (d.name) return `${who} ${action} «${d.name}»`;
    } catch {}
  }

  return `${who} ${action} ${entity}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    (async () => {
      const me = await fetch("/api/auth/me").then(r => r.json());
      if (!me.ok) { router.push("/admin/login"); return; }
      const safeJson = (r: Response): Promise<any> => r.json().catch(() => ({ ok: false }));
      const hasAudit = me.data.permissions?.includes("audit.view");
      const hasUsers = me.data.permissions?.includes("users.manage");
      const [uRes, sRes, pRes, lRes] = await Promise.all([
        hasUsers ? fetch("/api/users").then(safeJson) : Promise.resolve({ ok: false, data: [] }),
        fetch("/api/services").then(safeJson),
        fetch("/api/partners").then(safeJson),
        hasAudit ? fetch("/api/audit-logs").then(safeJson) : Promise.resolve({ ok: false, data: [] }),
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
        {hasPerm("users.manage") && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <p className="text-3xl font-bold text-white">{data.userCount}</p>
            <p className="mt-1 text-xs text-zinc-500">Сотрудников</p>
          </div>
        )}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-3xl font-bold text-white">{data.serviceCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Услуг</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          <p className="text-3xl font-bold text-white">{data.partnerCount}</p>
          <p className="mt-1 text-xs text-zinc-500">Партнёров</p>
        </div>

        {hasPerm("audit.view") && (
          <div className="col-span-full rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">Последние действия</h3>
            {data.recentLogs.length === 0 ? (
              <p className="text-xs text-zinc-600">Нет записей</p>
            ) : (
              <div className="space-y-2">
                {data.recentLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 text-xs text-zinc-500">
                    <Link href="/admin/audit-logs" className="flex items-center gap-3 truncate transition-colors hover:text-zinc-300">
                      <span className={`w-16 shrink-0 rounded px-1.5 py-0.5 text-center text-[10px] font-medium uppercase ${
                        log.action === "CREATE" ? "bg-green-900/50 text-green-300"
                        : log.action === "UPDATE" ? "bg-blue-900/50 text-blue-300"
                        : log.action === "DELETE" ? "bg-red-900/50 text-red-300"
                        : "bg-zinc-800 text-zinc-400"
                      }`}>{log.action}</span>
                      <span className="truncate">{describeLog(log)}</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
