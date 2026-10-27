"use client";

import { useCallback, useEffect, useState } from "react";
import UploadZone from "@/shared/ui/admin/upload-zone";
import { useToast } from "@/shared/lib/toast-context";
import { useDirtyForm } from "@/shared/lib/dirty-form-context";
import type { AutoPodborSection, AutoPodborSettings } from "@/entities/autopodbor/autopodbor.types";
import EntityManager, { formValues, normalizeFields, type FieldDef } from "./entity-manager";
import { getJson } from "../lib/api";

type Values = Record<string, string | boolean>;

const NUMBER_KEYS = [
  "priceFrom", "yearsExperience", "carsChecked", "citiesCount", "guaranteeDays", "avgSavings",
] as const;

const TEXT_KEYS = [
  "heroBadge", "heroTitle", "heroHighlight", "heroSubtitle", "heroImage", "heroImageAlt",
  "ctaPrimaryLabel", "ctaSecondaryLabel", "phone", "telegram", "whatsapp", "viber", "address",
  "workingHours", "reportTime", "expertName", "expertRole", "expertQuote", "expertPhoto",
  "expertFacts", "disclaimer", "seoTitle", "seoDescription", "ogImage",
] as const;

const BOOL_KEYS = ["isActive", "noindex"] as const;

const EMPTY: Values = Object.fromEntries([
  ...TEXT_KEYS.map(key => [key, ""]),
  ...NUMBER_KEYS.map(key => [key, ""]),
  ...BOOL_KEYS.map(key => [key, false]),
]);

function settingsToValues(settings: AutoPodborSettings): Values {
  const values: Values = { ...EMPTY };
  for (const key of TEXT_KEYS) values[key] = settings[key] ?? "";
  for (const key of NUMBER_KEYS) values[key] = settings[key] == null ? "" : String(settings[key]);
  for (const key of BOOL_KEYS) values[key] = Boolean(settings[key]);
  return values;
}

const SECTION_FIELDS: FieldDef[] = [
  { key: "key", label: "Ключ секции", help: "trust, quiz, risks, tariffs…" },
  { key: "badge", label: "Бейдж" },
  { key: "title", label: "Заголовок", full: true },
  { key: "subtitle", label: "Подзаголовок", type: "textarea", full: true },
  { key: "description", label: "Описание / доп. текст", type: "textarea", full: true },
  { key: "image", label: "Изображение", type: "image", full: true },
  { key: "imageAlt", label: "Alt-текст", full: true },
  { key: "isActive", label: "Секция включена", type: "checkbox" },
  { key: "sortOrder", label: "Порядок", type: "number" },
];
const SECTION_KEYS = SECTION_FIELDS.map(field => field.key);
const EMPTY_SECTION = {
  key: "", badge: "", title: "", subtitle: "", description: "", image: "", imageAlt: "",
  isActive: true, sortOrder: "0",
};

function Label({ text, help }: { text: string; help?: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400">{text}</span>
      {help && <span className="text-[10px] text-slate-600">{help}</span>}
    </span>
  );
}

export default function ContentTab() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { setDirty, isDirty } = useDirtyForm();

  const load = useCallback(async () => {
    const json = await getJson<AutoPodborSettings>("/api/autopodbor/settings");
    if (json?.ok && json.data) setValues(settingsToValues(json.data));
    else toast(json?.error ?? "Не удалось загрузить настройки", "error");
    setLoading(false);
    setDirty(false);
  }, [toast, setDirty]);

  // queueMicrotask: не вызываем setState синхронно в теле эффекта
  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  function set(key: string, value: string | boolean) {
    setValues(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function save() {
    if (!String(values.heroTitle ?? "").trim()) {
      toast("Заполните H1 (heroTitle)", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...values };
      for (const key of NUMBER_KEYS) {
        payload[key] = values[key] === "" ? null : Number(values[key]);
      }
      const response = await fetch("/api/autopodbor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        toast(json.error ?? "Не удалось сохранить", "error");
        return;
      }
      setValues(settingsToValues(json.data as AutoPodborSettings));
      setDirty(false);
      toast("Настройки сохранены");
    } catch {
      toast("Нет связи с сервером", "error");
    } finally {
      setSaving(false);
    }
  }

  const text = (key: keyof typeof EMPTY, label: string, help?: string) => (
    <label className="flex flex-col gap-1">
      <Label text={label} help={help} />
      <input
        value={String(values[key] ?? "")}
        onChange={event => set(key, event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
      />
    </label>
  );

  const area = (key: keyof typeof EMPTY, label: string, help?: string, rows = 3) => (
    <label className="flex flex-col gap-1 sm:col-span-2">
      <Label text={label} help={help} />
      <textarea
        rows={rows}
        value={String(values[key] ?? "")}
        onChange={event => set(key, event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
      />
    </label>
  );

  const num = (key: keyof typeof EMPTY, label: string, help?: string) => (
    <label className="flex flex-col gap-1">
      <Label text={label} help={help} />
      <input
        type="number"
        value={String(values[key] ?? "")}
        onChange={event => set(key, event.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
      />
    </label>
  );

  const check = (key: keyof typeof EMPTY, label: string) => (
    <label className="flex items-center gap-2 pt-6 text-sm text-slate-300">
      <input type="checkbox" checked={Boolean(values[key])} onChange={event => set(key, event.target.checked)} className="h-4 w-4 accent-red-600" />
      {label}
    </label>
  );

  const image = (key: keyof typeof EMPTY, label: string) => (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <Label text={label} />
      <input
        value={String(values[key] ?? "")}
        onChange={event => set(key, event.target.value)}
        placeholder="/uploads/autopodbor/..."
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
      />
      <UploadZone
        key={`settings-${key}-${String(values[key] ?? "")}`}
        category="autopodbor"
        currentPreview={String(values[key] ?? "")}
        onUpload={url => set(key, url)}
        label="Загрузить"
      />
    </div>
  );

  if (loading) return <p className="text-sm text-slate-500">Загрузка настроек…</p>;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-white">Контент лендинга</h3>
          <span className={`text-xs ${isDirty ? "text-amber-400" : "text-slate-600"}`}>
            {isDirty ? "Есть несохранённые изменения" : "Изменений нет"}
          </span>
        </div>

        <div className="space-y-6">
          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Публикация</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {check("isActive", "Лендинг опубликован")}
              {check("noindex", "Закрыть от индексации (noindex)")}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Hero</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("heroBadge", "Бейдж", "АВТОПОДБОР · МИНСК И БЕЛАРУСЬ")}
              {text("heroHighlight", "Подсветка в H1", "Живое авто")}
              {text("heroTitle", "H1")}
              {area("heroSubtitle", "Подзаголовок")}
              {text("ctaPrimaryLabel", "Кнопка 1")}
              {text("ctaSecondaryLabel", "Кнопка 2")}
              {image("heroImage", "Фоновое изображение")}
              {text("heroImageAlt", "Alt изображения")}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Гарантия</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              {num("guaranteeDays", "Дней гарантии", "0 — скрыть блок")}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Эксперт</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("expertName", "Имя")}
              {text("expertRole", "Роль")}
              {area("expertQuote", "Цитата")}
              {area("expertFacts", "Факты", "По одному в строке")}
              {image("expertPhoto", "Фото")}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Контакты</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("phone", "Телефон")}
              {text("telegram", "Telegram")}
              {text("whatsapp", "WhatsApp")}
              {text("viber", "Viber")}
              {text("address", "Адрес")}
              {text("workingHours", "Часы работы")}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">SEO</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              {text("seoTitle", "SEO title")}
              {area("seoDescription", "SEO description")}
              {image("ogImage", "OG-изображение (1200×630)")}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Юридическое</legend>
            {area("disclaimer", "Дисклеймер")}
          </fieldset>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Сохранение…" : "Сохранить контент"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5">
        <EntityManager<AutoPodborSection>
          entity="sections"
          title="Заголовки секций"
          addLabel="Добавить секцию"
          fields={SECTION_FIELDS}
          emptyForm={EMPTY_SECTION}
          toForm={item => formValues(item as unknown as Record<string, unknown>, SECTION_KEYS)}
          fromForm={form => normalizeFields(SECTION_FIELDS, form)}
          columns={[
            { key: "key", label: "Ключ", render: item => <code className="text-xs text-slate-400">{item.key}</code> },
            { key: "title", label: "Заголовок", render: item => item.title || "—" },
            { key: "subtitle", label: "Подзаголовок", render: item => (
              <span className="line-clamp-2 block max-w-md text-xs text-slate-500">{item.subtitle || "—"}</span>
            ) },
          ]}
          hint="Hero настраивается выше. Секции можно выключать и менять порядок."
        />
      </div>
    </div>
  );
}
