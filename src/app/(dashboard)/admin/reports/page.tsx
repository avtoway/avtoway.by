"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import type {
  InspectionReport,
  ReportChecklistItem,
  ReportCheckStatus,
  ReportExpense,
  ReportVerdict,
} from "@/entities/report/report.types";

const input = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";
const label = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500";
const smallBtn = "rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white";

const VERDICT_LABEL: Record<ReportVerdict, string> = {
  recommended: "Можно брать",
  caution: "Нужны вложения",
  reject: "Не рекомендуется",
};

const STATUS_LABEL: Record<ReportCheckStatus, string> = {
  ok: "Норма",
  attention: "Замечание",
  critical: "Критично",
};

interface FormState {
  id?: string;
  token?: string;
  carTitle: string;
  clientName: string;
  clientPhone: string;
  vin: string;
  mileageKm: string;
  inspectedAt: string;
  verdict: ReportVerdict;
  summary: string;
  checklist: ReportChecklistItem[];
  expenses: ReportExpense[];
  photosText: string;
  isPublished: boolean;
}

function emptyForm(): FormState {
  return {
    carTitle: "",
    clientName: "",
    clientPhone: "",
    vin: "",
    mileageKm: "",
    inspectedAt: new Date().toISOString().slice(0, 10),
    verdict: "recommended",
    summary: "",
    checklist: [{ category: "Кузов и ЛКП", title: "", status: "ok", note: "" }],
    expenses: [],
    photosText: "",
    isPublished: false,
  };
}

function toForm(report: InspectionReport): FormState {
  return {
    id: report.id,
    token: report.token,
    carTitle: report.carTitle,
    clientName: report.clientName ?? "",
    clientPhone: report.clientPhone ?? "",
    vin: report.vin ?? "",
    mileageKm: report.mileageKm != null ? String(report.mileageKm) : "",
    inspectedAt: report.inspectedAt ?? "",
    verdict: report.verdict,
    summary: report.summary ?? "",
    checklist: report.checklist.length > 0
      ? report.checklist.map(item => ({ ...item, note: item.note ?? "" }))
      : [{ category: "Кузов и ЛКП", title: "", status: "ok" as ReportCheckStatus, note: "" }],
    expenses: report.expenses.map(item => ({ ...item })),
    photosText: report.photos.join("\n"),
    isPublished: report.isPublished,
  };
}

export default function AdminReportsPage() {
  const [items, setItems] = useState<InspectionReport[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const json = await fetch("/api/reports", { cache: "no-store" }).then(r => r.json());
      if (json.ok) setItems(json.data);
      else toast(json.error ?? "Не удалось загрузить отчёты", "error");
    } catch {
      toast("Ошибка загрузки отчётов", "error");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void load(); }, []);

  async function save() {
    if (!form || !form.carTitle.trim()) {
      toast("Укажите автомобиль", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        carTitle: form.carTitle.trim(),
        clientName: form.clientName.trim() || undefined,
        clientPhone: form.clientPhone.trim() || undefined,
        vin: form.vin.trim() || undefined,
        mileageKm: form.mileageKm ? Number(form.mileageKm) : null,
        inspectedAt: form.inspectedAt || undefined,
        verdict: form.verdict,
        summary: form.summary.trim() || undefined,
        checklist: form.checklist.filter(item => item.title.trim()),
        expenses: form.expenses.filter(item => item.label.trim()).map(item => ({ ...item, amount: Number(item.amount) || 0 })),
        photos: form.photosText.split("\n").map(line => line.trim()).filter(Boolean),
        isPublished: form.isPublished,
      };

      const json = await fetch(form.id ? `/api/reports/${form.id}` : "/api/reports", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json());

      if (!json.ok) {
        toast(json.error ?? "Не удалось сохранить отчёт", "error");
        return;
      }
      setForm(toForm(json.data));
      toast("Отчёт сохранён");
      await load();
    } catch {
      toast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(report: InspectionReport) {
    const ok = await confirm({
      title: "Удаление отчёта",
      message: `Удалить отчёт по «${report.carTitle}»? Ссылка перестанет работать.`,
      confirmLabel: "Удалить",
      variant: "danger",
    });
    if (!ok) return;
    const json = await fetch(`/api/reports/${report.id}`, { method: "DELETE" }).then(r => r.json());
    if (json.ok) {
      toast("Отчёт удалён");
      if (form?.id === report.id) setForm(null);
      await load();
    } else {
      toast(json.error ?? "Ошибка удаления", "error");
    }
  }

  async function copyLink(token: string) {
    const url = `${window.location.origin}/report/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Ссылка скопирована");
    } catch {
      toast(url);
    }
  }

  const totalExpenses = useMemo(
    () => (form ? form.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0),
    [form],
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Отчёты осмотра</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Цифровые отчёты для клиентов автоподбора. Публичная ссылка вида /report/…, доступна только после публикации.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForm(emptyForm())}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          + Новый отчёт
        </button>
      </div>

      {form && (
        <section className="mb-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-white">{form.id ? "Редактирование отчёта" : "Новый отчёт"}</h2>
            <div className="flex items-center gap-2">
              {form.token && (
                <button type="button" onClick={() => void copyLink(form.token!)} className={smallBtn}>
                  Копировать ссылку
                </button>
              )}
              <button type="button" onClick={() => setForm(null)} className={smallBtn}>Закрыть</button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <label className="lg:col-span-2">
              <span className={label}>Автомобиль *</span>
              <input value={form.carTitle} onChange={e => setForm({ ...form, carTitle: e.target.value })} placeholder="BMW 530i, 2019" className={input} />
            </label>
            <label>
              <span className={label}>Вердикт</span>
              <select value={form.verdict} onChange={e => setForm({ ...form, verdict: e.target.value as ReportVerdict })} className={input}>
                {Object.entries(VERDICT_LABEL).map(([value, text]) => (
                  <option key={value} value={value}>{text}</option>
                ))}
              </select>
            </label>
            <label>
              <span className={label}>Клиент</span>
              <input value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className={input} />
            </label>
            <label>
              <span className={label}>Телефон клиента</span>
              <input value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} className={input} />
            </label>
            <label>
              <span className={label}>Дата осмотра</span>
              <input value={form.inspectedAt} onChange={e => setForm({ ...form, inspectedAt: e.target.value })} placeholder="2026-11-16" className={input} />
            </label>
            <label>
              <span className={label}>VIN</span>
              <input value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} className={input} />
            </label>
            <label>
              <span className={label}>Пробег, км</span>
              <input value={form.mileageKm} onChange={e => setForm({ ...form, mileageKm: e.target.value })} inputMode="numeric" className={input} />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
              Опубликовать по ссылке
            </label>
          </div>

          <label>
            <span className={label}>Заключение эксперта</span>
            <textarea rows={4} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} className={input} />
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Пункты проверки</span>
              <button
                type="button"
                onClick={() => setForm({
                  ...form,
                  checklist: [...form.checklist, { category: "Кузов и ЛКП", title: "", status: "ok", note: "" }],
                })}
                className={smallBtn}
              >
                + Пункт
              </button>
            </div>
            <div className="space-y-2">
              {form.checklist.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-slate-800 p-2 lg:grid-cols-[1fr_2fr_140px_1.5fr_auto]">
                  <input
                    value={item.category}
                    onChange={e => {
                      const checklist = [...form.checklist];
                      checklist[index] = { ...item, category: e.target.value };
                      setForm({ ...form, checklist });
                    }}
                    placeholder="Категория"
                    className={input}
                  />
                  <input
                    value={item.title}
                    onChange={e => {
                      const checklist = [...form.checklist];
                      checklist[index] = { ...item, title: e.target.value };
                      setForm({ ...form, checklist });
                    }}
                    placeholder="Пункт проверки"
                    className={input}
                  />
                  <select
                    value={item.status}
                    onChange={e => {
                      const checklist = [...form.checklist];
                      checklist[index] = { ...item, status: e.target.value as ReportCheckStatus };
                      setForm({ ...form, checklist });
                    }}
                    className={input}
                  >
                    {Object.entries(STATUS_LABEL).map(([value, text]) => (
                      <option key={value} value={value}>{text}</option>
                    ))}
                  </select>
                  <input
                    value={item.note ?? ""}
                    onChange={e => {
                      const checklist = [...form.checklist];
                      checklist[index] = { ...item, note: e.target.value };
                      setForm({ ...form, checklist });
                    }}
                    placeholder="Комментарий"
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, checklist: form.checklist.filter((_, i) => i !== index) })}
                    className="rounded-lg border border-red-900/50 px-2 text-xs text-red-300 hover:border-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Предстоящие расходы {totalExpenses > 0 && <span className="text-slate-500">· {totalExpenses.toLocaleString("ru-RU")} BYN</span>}
              </span>
              <button
                type="button"
                onClick={() => setForm({ ...form, expenses: [...form.expenses, { label: "", amount: 0 }] })}
                className={smallBtn}
              >
                + Расход
              </button>
            </div>
            <div className="space-y-2">
              {form.expenses.map((item, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-slate-800 p-2 sm:grid-cols-[2fr_1fr_auto]">
                  <input
                    value={item.label}
                    onChange={e => {
                      const expenses = [...form.expenses];
                      expenses[index] = { ...item, label: e.target.value };
                      setForm({ ...form, expenses });
                    }}
                    placeholder="Например: замена тормозных колодок"
                    className={input}
                  />
                  <input
                    value={item.amount}
                    onChange={e => {
                      const expenses = [...form.expenses];
                      expenses[index] = { ...item, amount: Number(e.target.value) || 0 };
                      setForm({ ...form, expenses });
                    }}
                    inputMode="numeric"
                    placeholder="BYN"
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, expenses: form.expenses.filter((_, i) => i !== index) })}
                    className="rounded-lg border border-red-900/50 px-2 text-xs text-red-300 hover:border-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <label>
            <span className={label}>Фото (по одной ссылке на строку)</span>
            <textarea rows={3} value={form.photosText} onChange={e => setForm({ ...form, photosText: e.target.value })} placeholder="/uploads/autopodbor/photo.jpg" className={input} />
          </label>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setForm(null)} className={smallBtn}>Отмена</button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить отчёт"}
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-500">
          Отчётов пока нет. Нажмите «Новый отчёт».
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map(report => (
            <article key={report.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{report.carTitle}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.clientName ?? "Без клиента"} · {report.inspectedAt ?? "без даты"} · {report.checklist.length} пунктов
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${
                  report.isPublished
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-700 bg-slate-800 text-slate-400"
                }`}>
                  {report.isPublished ? "Опубликован" : "Черновик"}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Вердикт: {VERDICT_LABEL[report.verdict]}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setForm(toForm(report))} className={smallBtn}>Редактировать</button>
                <button type="button" onClick={() => void copyLink(report.token)} className={smallBtn}>Ссылка</button>
                {report.isPublished && (
                  <a href={`/report/${report.token}`} target="_blank" rel="noopener noreferrer" className={smallBtn}>Открыть</a>
                )}
                <button type="button" onClick={() => void remove(report)} className="rounded-lg border border-red-900/50 px-2.5 py-1.5 text-xs text-red-300 transition hover:border-red-600">
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {dialog}
    </div>
  );
}
