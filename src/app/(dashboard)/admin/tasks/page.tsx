"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/shared/lib/toast-context";
import type { CrmAssignee, LeadTask } from "@/entities/crm/crm.types";

const SOURCE_LABEL: Record<string, string> = {
  contact: "Общая форма",
  rent: "Аренда",
  sale: "Продажа",
  autopodbor: "Автоподбор",
};

type Filter = "open" | "done" | "all";

const PAGE_NOW = Date.now();

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [assignees, setAssignees] = useState<CrmAssignee[]>([]);
  const [filter, setFilter] = useState<Filter>("open");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  async function load() {
    const [tasksJson, assigneesJson] = await Promise.all([
      fetch("/api/crm/tasks", { cache: "no-store" }).then(response => response.json()),
      fetch("/api/crm/assignees", { cache: "no-store" }).then(response => response.json()),
    ]);
    if (tasksJson.ok) setTasks(tasksJson.data);
    if (assigneesJson.ok) setAssignees(assigneesJson.data);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void load(); }, []);

  async function toggle(task: LeadTask) {
    const response = await fetch("/api/crm/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: task.status === "done" ? "open" : "done" }),
    });
    const json = await response.json();
    if (json.ok) setTasks(prev => prev.map(item => item.id === task.id ? json.data : item));
    else toast(json.error ?? "Ошибка", "error");
  }

  async function remove(task: LeadTask) {
    const response = await fetch(`/api/crm/tasks?id=${task.id}`, { method: "DELETE" });
    const json = await response.json();
    if (json.ok) {
      setTasks(prev => prev.filter(item => item.id !== task.id));
      toast("Задача удалена");
    } else {
      toast(json.error ?? "Ошибка", "error");
    }
  }

  const filtered = useMemo(() => tasks.filter(task => filter === "all" || task.status === filter), [tasks, filter]);
  const overdue = tasks.filter(task => task.status === "open" && task.dueAt && new Date(task.dueAt).getTime() < PAGE_NOW).length;
  const assigneeName = (id?: string) => assignees.find(user => user.id === id)?.name;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Задачи</h1>
          <p className="mt-0.5 text-sm text-slate-500">Напоминания по заявкам и клиентам. Просроченные задачи подсвечиваются.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-lg bg-red-500/10 px-3 py-2 text-red-300">Просрочено: {overdue}</span>
          <span className="rounded-lg bg-slate-800 px-3 py-2 text-slate-300">Открытых: {tasks.filter(task => task.status === "open").length}</span>
        </div>
      </div>

      <div className="mb-4 flex gap-1 border-b border-slate-800">
        {(["open", "done", "all"] as Filter[]).map(value => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${
              filter === value ? "border-red-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {value === "open" ? "Открытые" : value === "done" ? "Выполненные" : "Все"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center text-sm text-slate-500">
          Задач нет.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const isOverdue = task.status === "open" && task.dueAt && new Date(task.dueAt).getTime() < PAGE_NOW;
            return (
              <div key={task.id} className={`rounded-xl border bg-slate-900/30 p-4 ${isOverdue ? "border-red-500/40" : "border-slate-800"}`}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={task.status === "done"} onChange={() => void toggle(task)} className="mt-1" />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${task.status === "done" ? "text-slate-600 line-through" : "text-white"}`}>{task.title}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500">
                      <span className={`rounded px-1.5 py-0.5 ${isOverdue ? "bg-red-500/15 text-red-300" : "bg-slate-800 text-slate-400"}`}>
                        {task.dueAt ? new Date(task.dueAt).toLocaleDateString("ru-RU") : "без срока"}
                      </span>
                      <span>{SOURCE_LABEL[task.source] ?? task.source}</span>
                      {task.leadName && <span>{task.leadName}</span>}
                      {task.leadPhone && <span>{task.leadPhone}</span>}
                      {task.assignedToId && <span>Ответственный: {assigneeName(task.assignedToId) ?? "—"}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {task.leadPhone && (
                      <Link href={`/admin/clients?phone=${encodeURIComponent(task.leadPhone)}`} className="text-[10px] text-slate-400 hover:text-white">
                        Клиент
                      </Link>
                    )}
                    <button type="button" onClick={() => void remove(task)} className="text-[10px] text-red-400 hover:text-red-300">Удалить</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
