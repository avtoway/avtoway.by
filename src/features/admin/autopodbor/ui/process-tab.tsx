"use client";

import { useState } from "react";
import type { AutoPodborCheckItem, AutoPodborFeature, AutoPodborStep } from "@/entities/autopodbor/autopodbor.types";
import EntityManager, { formValues, normalizeFields, type FieldDef } from "./entity-manager";
import { CHECK_CATEGORY_OPTIONS, FEATURE_TYPE_OPTIONS, ICON_OPTIONS } from "../lib/options";

type SubTab = "steps" | "checks" | "risks" | "advantages" | "guarantees" | "trust";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "steps", label: "Этапы" },
  { id: "checks", label: "Проверки" },
  { id: "risks", label: "Риски" },
  { id: "advantages", label: "Преимущества" },
  { id: "guarantees", label: "Гарантии" },
  { id: "trust", label: "Trust-bar" },
];

/* ─── steps ─── */

const STEP_FIELDS: FieldDef[] = [
  { key: "title", label: "Название", placeholder: "Заявка и бриф" },
  { key: "duration", label: "Срок", placeholder: "15 минут" },
  { key: "icon", label: "Иконка", type: "select", options: ICON_OPTIONS },
  { key: "description", label: "Описание", type: "textarea", full: true },
  { key: "sortOrder", label: "Порядок", type: "number" },
  { key: "isActive", label: "Активен", type: "checkbox" },
];
const STEP_KEYS = STEP_FIELDS.map(field => field.key);
const EMPTY_STEP = { title: "", duration: "", icon: "check", description: "", sortOrder: "0", isActive: true };

/* ─── checks ─── */

const CHECK_FIELDS: FieldDef[] = [
  { key: "category", label: "Категория", type: "select", options: CHECK_CATEGORY_OPTIONS },
  { key: "title", label: "Что проверяем", placeholder: "Толщиномер по всем элементам" },
  { key: "description", label: "Пояснение", type: "textarea", full: true },
  { key: "isCritical", label: "Критично", type: "checkbox" },
  { key: "sortOrder", label: "Порядок", type: "number" },
  { key: "isActive", label: "Активна", type: "checkbox" },
];
const CHECK_KEYS = CHECK_FIELDS.map(field => field.key);
const EMPTY_CHECK = { category: "body", title: "", description: "", isCritical: false, sortOrder: "0", isActive: true };

/* ─── features ─── */

const FEATURE_FIELDS: FieldDef[] = [
  { key: "title", label: "Заголовок" },
  { key: "icon", label: "Иконка", type: "select", options: ICON_OPTIONS },
  { key: "stat", label: "Цифра/акцент", placeholder: "30 дней" },
  { key: "description", label: "Описание", type: "textarea", full: true },
  { key: "sortOrder", label: "Порядок", type: "number" },
  { key: "isActive", label: "Активна", type: "checkbox" },
];
const FEATURE_KEYS = FEATURE_FIELDS.map(field => field.key);

function emptyFeature(type: string) {
  return { type, title: "", icon: "shield", stat: "", description: "", sortOrder: "0", isActive: true };
}

function FeatureManager({ type, title }: { type: string; title: string }) {
  return (
    <EntityManager<AutoPodborFeature>
      entity="features"
      title={title}
      addLabel="Добавить карточку"
      fields={FEATURE_FIELDS}
      emptyForm={emptyFeature(type)}
      filterFn={item => item.type === type}
      sortable={false}
      toForm={item => ({ ...formValues(item as unknown as Record<string, unknown>, FEATURE_KEYS), type: item.type })}
      fromForm={form => ({ ...normalizeFields(FEATURE_FIELDS, form), type })}
      columns={[
        { key: "title", label: "Заголовок", render: item => <span className="font-medium text-white">{item.title}</span> },
        { key: "stat", label: "Акцент", render: item => item.stat || "—" },
        { key: "description", label: "Описание", render: item => (
          <span className="line-clamp-2 block max-w-md text-xs text-slate-400">{item.description || "—"}</span>
        ) },
      ]}
    />
  );
}

export default function ProcessTab() {
  const [tab, setTab] = useState<SubTab>("steps");

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1 border-b border-slate-800">
        {SUB_TABS.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition ${
              tab === item.id ? "border-red-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "steps" && (
        <EntityManager<AutoPodborStep>
          entity="steps"
          title="Этапы работы"
          addLabel="Добавить этап"
          fields={STEP_FIELDS}
          emptyForm={EMPTY_STEP}
          toForm={item => formValues(item as unknown as Record<string, unknown>, STEP_KEYS)}
          fromForm={form => ({ ...normalizeFields(STEP_FIELDS, form), icon: form.icon || "check" })}
          columns={[
            { key: "title", label: "Этап", render: item => (
              <div>
                <p className="font-medium text-white">{item.title}</p>
                {item.duration && <p className="text-[11px] text-slate-500">{item.duration}</p>}
              </div>
            ) },
            { key: "description", label: "Описание", render: item => (
              <span className="line-clamp-2 block max-w-lg text-xs text-slate-400">{item.description || "—"}</span>
            ) },
          ]}
        />
      )}

      {tab === "checks" && (
        <EntityManager<AutoPodborCheckItem>
          entity="checks"
          title="Что проверяем"
          addLabel="Добавить проверку"
          fields={CHECK_FIELDS}
          emptyForm={EMPTY_CHECK}
          toForm={item => formValues(item as unknown as Record<string, unknown>, CHECK_KEYS)}
          fromForm={form => ({ ...normalizeFields(CHECK_FIELDS, form), category: form.category || "body" })}
          columns={[
            { key: "category", label: "Категория", render: item =>
              CHECK_CATEGORY_OPTIONS.find(option => option.value === item.category)?.label ?? item.category },
            { key: "title", label: "Проверка", render: item => (
              <span className="font-medium text-white">{item.title}</span>
            ) },
            { key: "isCritical", label: "Критично", render: item => item.isCritical ? "да" : "—" },
          ]}
        />
      )}

      {tab === "risks" && <FeatureManager type="risk" title="Карточки рисков" />}
      {tab === "advantages" && <FeatureManager type="advantage" title="Преимущества" />}
      {tab === "guarantees" && <FeatureManager type="guarantee" title="Гарантии" />}
      {tab === "trust" && <FeatureManager type="trust" title="Trust-bar" />}

      <p className="mt-4 text-xs text-slate-600">
        Тип карточки «{FEATURE_TYPE_OPTIONS.find(option => option.value === tab)?.label ?? "—"}» задаётся разделом.
      </p>
    </div>
  );
}
