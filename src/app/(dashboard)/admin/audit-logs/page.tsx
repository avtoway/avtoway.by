"use client";

import { useEffect, useState } from "react";
import AuditFilters from "@/features/admin/audit-logs/ui/audit-filters";

interface LogEntry {
  id: string; userId: string; action: string; entity: string;
  entityId: string; details: string | null; createdAt: string;
  userName?: string; userLogin?: string;
}

const ACTION_LABEL: Record<string, string> = {
  CREATE: "Создание",
  UPDATE: "Изменение",
  DELETE: "Удаление",
};

const ACTION_COLOR: Record<string, string> = {
  CREATE: "bg-green-900/50 text-green-300",
  UPDATE: "bg-blue-900/50 text-blue-300",
  DELETE: "bg-red-900/50 text-red-300",
};

const ENTITY_LABEL: Record<string, string> = {
  User: "Пользователь",
  Role: "Роль",
  Service: "Услуга",
  Partner: "Партнёр",
};

const FIELD_LABEL: Record<string, string> = {
  name: "имя", login: "логин", email: "email", phone: "телефон",
  birthDate: "дату рождения", telegram: "Telegram", position: "должность",
  workSchedule: "график", hireDate: "дату найма", bio: "о себе",
  photo: "фото", password: "пароль",
  title: "название", description: "описание", slug: "slug",
  icon: "иконку", color: "цвет", isActive: "активность",
  sortOrder: "порядок",
};

function describeWho(log: LogEntry): string {
  return log.userName || log.userLogin || log.userId.slice(0, 8);
}

function describeChanges(fields: string[]): string {
  const labels = fields.map(f => FIELD_LABEL[f] || f).filter(Boolean);
  if (labels.length === 0) return "";
  if (labels.length <= 3) return labels.join(", ");
  return labels.slice(0, 3).join(", ") + ` и ещё ${labels.length - 3}`;
}

function actionDescription(log: LogEntry): string {
  const action = ACTION_LABEL[log.action] ?? log.action;
  const who = describeWho(log);

  if (log.details) {
    try {
      const d = JSON.parse(log.details);

      if (log.entity === "User" && log.action === "CREATE" && d.login) {
        return `${who} создал(а) пользователя ${d.login}`;
      }
      if (log.entity === "User" && log.action === "DELETE") {
        return `${who} удалил(а) пользователя`;
      }
      if (log.entity === "User" && log.action === "UPDATE") {
        const changed = describeChanges(d.changes);
        if (changed) return `${who} изменил(а) ${changed}`;
      }

      if (log.entity === "Service" && d.title) {
        return `${who} ${action.toLowerCase()} услугу «${d.title}»`;
      }

      if (log.entity === "Partner" && d.name) {
        return `${who} ${action.toLowerCase()} партнёра «${d.name}»`;
      }

      if (log.entity === "Role" && d.name) {
        return `${who} ${action.toLowerCase()} роль «${d.name}»`;
      }
    } catch {}
  }

  const entity = ENTITY_LABEL[log.entity] ?? log.entity;
  return `${who} — ${action.toLowerCase()} ${entity.toLowerCase()}`;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/audit-logs").then(r => r.json());
      if (res.ok) setLogs(res.data);
      setLoading(false);
    })();
  }, []);

  const actions = [...new Set(logs.map(l => l.action))];
  const entities = [...new Set(logs.map(l => l.entity))];

  const filtered = logs.filter(l => {
    if (actionFilter && l.action !== actionFilter) return false;
    if (entityFilter && l.entity !== entityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (l.userName ?? "").toLowerCase().includes(q)
        || (l.userLogin ?? "").toLowerCase().includes(q)
        || actionDescription(l).toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Журнал аудита</h1>
        <p className="mt-0.5 text-sm text-slate-500">Последние 100 действий</p>
      </div>

      <AuditFilters search={search} onSearchChange={setSearch}
        actionFilter={actionFilter} onActionFilterChange={setActionFilter}
        entityFilter={entityFilter} onEntityFilterChange={setEntityFilter}
        actions={actions} entities={entities}
        filteredCount={filtered.length} totalCount={logs.length} />

      {loading ? <p className="text-slate-500">Загрузка...</p> : filtered.length === 0 ? (
        <p className="text-slate-500">Нет записей</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Дата</th>
                <th className="px-4 py-3 font-medium text-slate-400">Действие</th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <>
                  <tr key={l.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 cursor-pointer" onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-white">{actionDescription(l)}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{expanded === l.id ? "▲" : "▼"}</td>
                  </tr>
                  {expanded === l.id && (
                    <tr key={`${l.id}-detail`} className="bg-slate-900/30">
                      <td colSpan={3} className="px-4 py-3">
                        <div className="space-y-1 text-xs text-slate-400">
                          <p><span className="text-slate-500">Пользователь:</span> {describeWho(l)}{l.userLogin ? ` @${l.userLogin}` : ""}</p>
                          <p><span className="text-slate-500">Тип:</span> {badge(l.action)} <span className="ml-2 text-slate-500">{ENTITY_LABEL[l.entity] ?? l.entity}</span></p>
                          <p><span className="text-slate-500">ID сущности:</span> <span className="font-mono">{l.entityId}</span></p>
                          {l.details && (
                            <div>
                              <p className="mb-1 text-slate-500">Детали:</p>
                              <pre className="overflow-auto rounded bg-slate-950 p-2 text-[10px] text-slate-500">{(() => { try { return JSON.stringify(JSON.parse(l.details!), null, 2); } catch { return l.details; } })()}</pre>
                            </div>
                          )}
                          <p><span className="text-slate-500">Время:</span> {l.createdAt}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function badge(action: string) {
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${ACTION_COLOR[action] ?? "bg-slate-800 text-slate-400"}`}>{ACTION_LABEL[action] ?? action}</span>;
}
