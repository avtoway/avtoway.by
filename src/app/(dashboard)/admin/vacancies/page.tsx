"use client";

import { useEffect, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import VacancyForm from "@/features/admin/vacancies/ui/vacancy-form";
import { useFormValidation } from "@/shared/lib/use-form-validation";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { VacancySchema } from "@/entities/vacancy/vacancy.schema";
import type { Vacancy } from "@/entities/vacancy/vacancy";
import { employmentLabel, formatSalary, formatPublished } from "@/features/vacancies/lib/vacancy-format";

const EMPTY: Vacancy = {
  id: "",
  slug: "",
  title: "",
  department: "",
  location: "Минск",
  employmentType: "full_time",
  workFormat: "",
  experience: "",
  schedule: "",
  salaryFrom: undefined,
  salaryTo: undefined,
  salaryCurrency: "BYN",
  salaryPeriod: "month",
  shortDescription: "",
  description: "",
  responsibilities: "",
  requirements: "",
  conditions: "",
  benefits: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  contactTelegram: "",
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
  publishedAt: new Date().toISOString(),
};

type Filter = "all" | "active" | "hidden";

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vacancy | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const { form, setField, errors, validateAll, resetForm } = useFormValidation(VacancySchema, EMPTY as any);

  async function loadVacancies() {
    setLoading(true);
    const res = await fetch("/api/vacancies", { cache: "no-store" }).then((r) => r.json());
    if (res.ok) setVacancies(res.data);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/vacancies", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setVacancies(json.data);
        setLoading(false);
      });
  }, []);

  function openCreate() {
    resetForm({
      ...EMPTY,
      sortOrder: vacancies.length,
      publishedAt: new Date().toISOString(),
    });
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(vacancy: Vacancy) {
    resetForm({
      ...vacancy,
      department: vacancy.department ?? "",
      workFormat: vacancy.workFormat ?? "",
      experience: vacancy.experience ?? "",
      schedule: vacancy.schedule ?? "",
      description: vacancy.description ?? "",
      responsibilities: vacancy.responsibilities ?? "",
      requirements: vacancy.requirements ?? "",
      conditions: vacancy.conditions ?? "",
      benefits: vacancy.benefits ?? "",
      contactName: vacancy.contactName ?? "",
      contactPhone: vacancy.contactPhone ?? "",
      contactEmail: vacancy.contactEmail ?? "",
      contactTelegram: vacancy.contactTelegram ?? "",
    });
    setEditing(vacancy);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!validateAll()) return;
    setSaving(true);

    const body: Record<string, unknown> = { ...form };
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;

    const url = editing ? `/api/vacancies/${editing.id}` : "/api/vacancies";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.ok) {
      setModalOpen(false);
      await loadVacancies();
      toast(editing ? "Вакансия сохранена" : "Вакансия создана");
    } else {
      toast(json.error ?? "Не удалось сохранить вакансию", "error");
    }
    setSaving(false);
  }

  async function toggleActive(vacancy: Vacancy) {
    const res = await fetch(`/api/vacancies/${vacancy.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !vacancy.isActive }),
    });
    const json = await res.json();
    if (json.ok) {
      await loadVacancies();
      toast(vacancy.isActive ? "Вакансия скрыта" : "Вакансия опубликована");
    } else {
      toast(json.error ?? "Ошибка", "error");
    }
  }

  async function handleDelete(vacancy: Vacancy) {
    const ok = await confirm({
      title: "Удаление вакансии",
      message: `Удалить вакансию «${vacancy.title}»? Действие нельзя отменить.`,
      confirmLabel: "Удалить",
      variant: "danger",
    });
    if (!ok) return;

    const res = await fetch(`/api/vacancies/${vacancy.id}`, { method: "DELETE" });
    if (res.ok) {
      await loadVacancies();
      toast("Вакансия удалена");
    } else {
      toast("Не удалось удалить вакансию", "error");
    }
  }

  const filtered = vacancies.filter((vacancy) => {
    const matchesSearch =
      vacancy.title.toLowerCase().includes(search.toLowerCase()) ||
      vacancy.slug.toLowerCase().includes(search.toLowerCase()) ||
      (vacancy.department ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "active" ? vacancy.isActive : !vacancy.isActive);
    return matchesSearch && matchesFilter;
  });

  const activeCount = vacancies.filter((vacancy) => vacancy.isActive).length;
  const hiddenCount = vacancies.length - activeCount;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Вакансии</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Управление открытыми вакансиями на странице «Вакансии»
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          + Добавить вакансию
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Всего</p>
          <p className="mt-1 text-2xl font-bold text-white">{vacancies.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-emerald-400">Опубликовано</p>
          <p className="mt-1 text-2xl font-bold text-white">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Скрыто</p>
          <p className="mt-1 text-2xl font-bold text-white">{hiddenCount}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по названию, отделу или slug..."
          className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
        />
        <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
          {([
            ["all", "Все"],
            ["active", "Активные"],
            ["hidden", "Скрытые"],
          ] as Array<[Filter, string]>).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-md px-3 py-1.5 text-xs transition ${
                filter === value ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-300">
            {vacancies.length === 0 ? "Пока нет вакансий" : "По фильтру ничего не найдено"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {vacancies.length === 0
              ? "Добавьте первую вакансию — она сразу появится на публичной странице."
              : "Попробуйте изменить запрос или фильтр."}
          </p>
          {vacancies.length === 0 && (
            <button
              onClick={openCreate}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              + Добавить вакансию
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Вакансия</th>
                <th className="px-4 py-3 font-medium text-slate-400">Отдел</th>
                <th className="px-4 py-3 font-medium text-slate-400">Условия</th>
                <th className="px-4 py-3 font-medium text-slate-400">Оплата</th>
                <th className="px-4 py-3 font-medium text-slate-400">Статус</th>
                <th className="px-4 py-3 font-medium text-slate-400">Опубликовано</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((vacancy) => (
                <tr
                  key={vacancy.id}
                  className={`border-b border-slate-800/50 transition hover:bg-slate-900/50 ${
                    !vacancy.isActive ? "opacity-50" : ""
                  }`}
                >
                  <td className="max-w-[260px] px-4 py-3">
                    <div className="flex items-start gap-2">
                      <p className="line-clamp-2 min-w-0 font-medium text-white">{vacancy.title}</p>
                      {vacancy.isFeatured && (
                        <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                          Срочно
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[10px] text-slate-600">/vacancies/{vacancy.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <p>{vacancy.department || "—"}</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">{vacancy.location}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <p>{employmentLabel(vacancy.employmentType)}</p>
                    {(vacancy.experience || vacancy.schedule) && (
                      <p className="mt-0.5 text-[10px] text-slate-600">
                        {[vacancy.experience, vacancy.schedule].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-amber-300">{formatSalary(vacancy)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(vacancy)}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                        vacancy.isActive
                          ? "bg-green-900/40 text-green-300 hover:bg-green-900/60"
                          : "bg-slate-800 text-slate-500 hover:bg-slate-700"
                      }`}
                    >
                      {vacancy.isActive ? "Активна" : "Скрыта"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatPublished(vacancy.publishedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(vacancy)}
                        className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                      >
                        Ред
                      </button>
                      <button
                        onClick={() => handleDelete(vacancy)}
                        className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300"
                      >
                        Удл
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Редактировать вакансию" : "Новая вакансия"}
        size="xl"
      >
        <VacancyForm form={form as unknown as Vacancy} onChange={setField} editing={!!editing} errors={errors} />
        <div className="sticky bottom-0 -mx-6 mt-5 flex justify-end gap-3 border-t border-slate-800 bg-slate-950 px-6 py-4">
          <button
            onClick={() => setModalOpen(false)}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </AdminModal>
      {dialog}
    </div>
  );
}
