"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";
import type { CrmAssignee, LeadMeta, LeadNote, LeadSource, LeadTask } from "@/entities/crm/crm.types";

const input = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";
const label = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500";

function dateOnly(value?: string) {
  return value ? value.slice(0, 10) : "";
}

export default function LeadCrmPanel({
  source,
  leadId,
  leadName,
  phone,
  onClose,
}: {
  source: LeadSource;
  leadId: string;
  leadName: string;
  phone?: string;
  onClose: () => void;
}) {
  const [meta, setMeta] = useState<LeadMeta | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [assignees, setAssignees] = useState<CrmAssignee[]>([]);
  const [noteText, setNoteText] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueAt, setTaskDueAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ source, leadId });
      const [metaJson, notesJson, tasksJson, assigneesJson] = await Promise.all([
        fetch(`/api/crm/meta?${params}`, { cache: "no-store" }).then(response => response.json()),
        fetch(`/api/crm/notes?${params}`, { cache: "no-store" }).then(response => response.json()),
        fetch(`/api/crm/tasks?${params}`, { cache: "no-store" }).then(response => response.json()),
        fetch("/api/crm/assignees", { cache: "no-store" }).then(response => response.json()),
      ]);
      if (metaJson.ok) setMeta(metaJson.data);
      if (notesJson.ok) setNotes(notesJson.data);
      if (tasksJson.ok) setTasks(tasksJson.data);
      if (assigneesJson.ok) setAssignees(assigneesJson.data);
    } catch {
      toast("Не удалось загрузить CRM-данные", "error");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void load(); }, [source, leadId]);

  function patchMeta(patch: Partial<LeadMeta>) {
    setMeta(prev => prev ? { ...prev, ...patch } : {
      id: "",
      source,
      leadId,
      assignedToId: undefined,
      rejectionReason: undefined,
      nextContactAt: undefined,
      internalNote: undefined,
      createdAt: "",
      updatedAt: "",
      ...patch,
    });
  }

  async function saveMeta() {
    setSaving(true);
    try {
      const response = await fetch("/api/crm/meta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          leadId,
          assignedToId: meta?.assignedToId || null,
          rejectionReason: meta?.rejectionReason ?? "",
          nextContactAt: meta?.nextContactAt ? dateOnly(meta.nextContactAt) : "",
          internalNote: meta?.internalNote ?? "",
        }),
      });
      const json = await response.json();
      if (json.ok) {
        setMeta(json.data);
        toast("CRM-данные сохранены");
      } else {
        toast(json.error ?? "Не удалось сохранить", "error");
      }
    } catch {
      toast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }

  async function addNote() {
    if (!noteText.trim()) return;
    const response = await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, leadId, text: noteText.trim() }),
    });
    const json = await response.json();
    if (json.ok) {
      setNotes(prev => [json.data, ...prev]);
      setNoteText("");
      toast("Заметка добавлена");
    } else {
      toast(json.error ?? "Ошибка", "error");
    }
  }

  async function addTask() {
    if (!taskTitle.trim()) return;
    const response = await fetch("/api/crm/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source,
        leadId,
        clientPhone: phone,
        title: taskTitle.trim(),
        dueAt: taskDueAt,
        assignedToId: meta?.assignedToId || undefined,
      }),
    });
    const json = await response.json();
    if (json.ok) {
      setTasks(prev => [json.data, ...prev]);
      setTaskTitle("");
      setTaskDueAt("");
      toast("Задача создана");
    } else {
      toast(json.error ?? "Ошибка", "error");
    }
  }

  async function toggleTask(task: LeadTask) {
    const response = await fetch("/api/crm/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status: task.status === "done" ? "open" : "done" }),
    });
    const json = await response.json();
    if (json.ok) setTasks(prev => prev.map(item => item.id === task.id ? json.data : item));
    else toast(json.error ?? "Ошибка", "error");
  }

  async function removeTask(task: LeadTask) {
    const response = await fetch(`/api/crm/tasks?id=${task.id}`, { method: "DELETE" });
    const json = await response.json();
    if (json.ok) setTasks(prev => prev.filter(item => item.id !== task.id));
    else toast(json.error ?? "Ошибка", "error");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={onClose}>
      <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-slate-800 bg-slate-950 p-5" onClick={event => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">CRM · {leadName}</h3>
            <p className="text-xs text-slate-500">{source} · {leadId}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white">✕</button>
        </div>

        {loading ? <p className="text-sm text-slate-500">Загрузка...</p> : (
          <div className="space-y-5">
            <section className="rounded-xl border border-slate-800 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className={label}>Ответственный</span>
                  <select value={meta?.assignedToId ?? ""} onChange={event => patchMeta({ assignedToId: event.target.value || undefined })} className={input}>
                    <option value="">Не назначен</option>
                    {assignees.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                  </select>
                </label>
                <label>
                  <span className={label}>Следующий контакт</span>
                  <input type="date" value={dateOnly(meta?.nextContactAt)} onChange={event => patchMeta({ nextContactAt: event.target.value || undefined })} className={input} />
                </label>
                <label className="sm:col-span-2">
                  <span className={label}>Причина отказа</span>
                  <input value={meta?.rejectionReason ?? ""} onChange={event => patchMeta({ rejectionReason: event.target.value })} placeholder="Например: дорого, выбрал другой вариант" className={input} />
                </label>
                <label className="sm:col-span-2">
                  <span className={label}>Внутренняя заметка</span>
                  <textarea rows={3} value={meta?.internalNote ?? ""} onChange={event => patchMeta({ internalNote: event.target.value })} className={input} />
                </label>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-600">При сохранении новая заявка автоматически перейдёт в статус «В работе».</p>
                <button type="button" onClick={() => void saveMeta()} disabled={saving} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {saving ? "Сохранение..." : "Сохранить CRM"}
                </button>
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 p-4">
              <h4 className="mb-3 text-sm font-semibold text-white">Заметки и история</h4>
              <div className="flex gap-2">
                <input value={noteText} onChange={event => setNoteText(event.target.value)} placeholder="Добавить заметку..." className={input} onKeyDown={event => { if (event.key === "Enter") void addNote(); }} />
                <button type="button" onClick={() => void addNote()} className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white">Добавить</button>
              </div>
              <div className="mt-3 space-y-2">
                {notes.length === 0 ? <p className="text-xs text-slate-600">Заметок пока нет.</p> : notes.map(note => (
                  <div key={note.id} className="rounded-lg bg-slate-900/60 p-3 text-sm text-slate-300">
                    <p>{note.text}</p>
                    <p className="mt-1 text-[10px] text-slate-600">{note.author ?? "Сотрудник"} · {new Date(note.createdAt).toLocaleString("ru-RU")}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-800 p-4">
              <h4 className="mb-3 text-sm font-semibold text-white">Задачи и напоминания</h4>
              <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
                <input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="Позвонить, отправить смету..." className={input} />
                <input type="date" value={taskDueAt} onChange={event => setTaskDueAt(event.target.value)} className={input} />
                <button type="button" onClick={() => void addTask()} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white">Создать</button>
              </div>
              <div className="mt-3 space-y-2">
                {tasks.length === 0 ? <p className="text-xs text-slate-600">Задач пока нет.</p> : tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 rounded-lg bg-slate-900/60 p-3">
                    <input type="checkbox" checked={task.status === "done"} onChange={() => void toggleTask(task)} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${task.status === "done" ? "text-slate-600 line-through" : "text-slate-200"}`}>{task.title}</p>
                      <p className="text-[10px] text-slate-600">
                        {task.dueAt ? `до ${new Date(task.dueAt).toLocaleDateString("ru-RU")}` : "без срока"}
                      </p>
                    </div>
                    <button type="button" onClick={() => void removeTask(task)} className="text-[11px] text-red-400">Удалить</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
