"use client";

import { useState } from "react";
import type { AutoPodborFaq, AutoPodborReview } from "@/entities/autopodbor/autopodbor.types";
import EntityManager, { formValues, normalizeFields, type FieldDef } from "./entity-manager";
import { REVIEW_SOURCE_OPTIONS } from "../lib/options";

type SubTab = "reviews" | "faq";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "reviews", label: "Отзывы" },
  { id: "faq", label: "FAQ" },
];

/* ─── reviews ─── */

const REVIEW_FIELDS: FieldDef[] = [
  { key: "name", label: "Имя" },
  { key: "city", label: "Город" },
  { key: "car", label: "Авто" },
  { key: "rating", label: "Оценка (1–5)", type: "number" },
  { key: "source", label: "Источник", type: "select", options: REVIEW_SOURCE_OPTIONS },
  { key: "sourceUrl", label: "Ссылка на отзыв" },
  { key: "text", label: "Текст", type: "textarea", full: true },
  { key: "isPublished", label: "Опубликован", type: "checkbox" },
  { key: "sortOrder", label: "Порядок", type: "number" },
];
const REVIEW_KEYS = REVIEW_FIELDS.map(field => field.key);
const EMPTY_REVIEW = {
  name: "", city: "", car: "", rating: "5", source: "site", sourceUrl: "", text: "",
  isPublished: false, sortOrder: "0",
};

/* ─── faq ─── */

const FAQ_FIELDS: FieldDef[] = [
  { key: "question", label: "Вопрос", full: true },
  { key: "answer", label: "Ответ", type: "textarea", full: true },
  { key: "category", label: "Категория" },
  { key: "isActive", label: "Активен", type: "checkbox" },
  { key: "sortOrder", label: "Порядок", type: "number" },
];
const FAQ_KEYS = FAQ_FIELDS.map(field => field.key);
const EMPTY_FAQ = { question: "", answer: "", category: "", isActive: true, sortOrder: "0" };

export default function ProofTab() {
  const [tab, setTab] = useState<SubTab>("reviews");

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

      {tab === "reviews" && (
        <EntityManager<AutoPodborReview>
          entity="reviews"
          title="Отзывы"
          addLabel="Добавить отзыв"
          fields={REVIEW_FIELDS}
          emptyForm={EMPTY_REVIEW}
          activeKey="isPublished"
          toForm={item => formValues(item as unknown as Record<string, unknown>, REVIEW_KEYS)}
          fromForm={form => ({ ...normalizeFields(REVIEW_FIELDS, form), source: form.source || "site", rating: form.rating || 5 })}
          columns={[
            { key: "name", label: "Имя", render: item => <span className="font-medium text-white">{item.name}</span> },
            { key: "rating", label: "Оценка", render: item => `${item.rating}/5` },
            { key: "source", label: "Источник", render: item =>
              REVIEW_SOURCE_OPTIONS.find(option => option.value === item.source)?.label ?? item.source },
            { key: "text", label: "Текст", render: item => (
              <span className="line-clamp-2 block max-w-md text-xs text-slate-400">{item.text}</span>
            ) },
          ]}
          hint="Публикуйте только подтверждённые отзывы. Кнопка ●/○ — опубликовать/скрыть."
        />
      )}

      {tab === "faq" && (
        <EntityManager<AutoPodborFaq>
          entity="faq"
          title="FAQ"
          addLabel="Добавить вопрос"
          fields={FAQ_FIELDS}
          emptyForm={EMPTY_FAQ}
          toForm={item => formValues(item as unknown as Record<string, unknown>, FAQ_KEYS)}
          fromForm={form => normalizeFields(FAQ_FIELDS, form)}
          columns={[
            { key: "question", label: "Вопрос", render: item => (
              <span className="font-medium text-white">{item.question}</span>
            ) },
            { key: "category", label: "Категория", render: item => item.category || "—" },
            { key: "answer", label: "Ответ", render: item => (
              <span className="line-clamp-2 block max-w-md text-xs text-slate-400">{item.answer}</span>
            ) },
          ]}
        />
      )}
    </div>
  );
}
