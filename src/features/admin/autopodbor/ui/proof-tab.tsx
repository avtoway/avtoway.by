"use client";

import { useState } from "react";
import type { AutoPodborCase, AutoPodborFaq, AutoPodborGalleryItem, AutoPodborReview } from "@/entities/autopodbor/autopodbor.types";
import EntityManager, { formValues, normalizeFields, type FieldDef } from "./entity-manager";
import { GALLERY_SECTION_OPTIONS, REVIEW_SOURCE_OPTIONS } from "../lib/options";

type SubTab = "cases" | "reviews" | "gallery" | "faq";

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: "cases", label: "Кейсы" },
  { id: "reviews", label: "Отзывы" },
  { id: "gallery", label: "Галерея" },
  { id: "faq", label: "FAQ" },
];

/* ─── cases ─── */

const CASE_FIELDS: FieldDef[] = [
  { key: "title", label: "Заголовок", placeholder: "Volkswagen Passat B8" },
  { key: "slug", label: "Slug", placeholder: "оставьте пустым — из названия" },
  { key: "brand", label: "Марка" },
  { key: "model", label: "Модель" },
  { key: "year", label: "Год", type: "number" },
  { key: "city", label: "Город" },
  { key: "budget", label: "Бюджет, $", type: "number" },
  { key: "purchasePrice", label: "Цена покупки, $", type: "number" },
  { key: "tradeAmount", label: "Торг, $", type: "number" },
  { key: "days", label: "Дней", type: "number" },
  { key: "completedAt", label: "Дата", type: "date" },
  { key: "task", label: "Задача", type: "textarea", full: true },
  { key: "found", label: "Что нашли", type: "textarea", full: true },
  { key: "result", label: "Итог", type: "textarea", full: true },
  { key: "photos", label: "Фото (URL через запятую)", type: "textarea", full: true },
  { key: "mainPhoto", label: "Главное фото", type: "image", full: true },
  { key: "isActive", label: "Опубликован", type: "checkbox" },
  { key: "sortOrder", label: "Порядок", type: "number" },
];
const CASE_KEYS = CASE_FIELDS.map(field => field.key);
const EMPTY_CASE = {
  title: "", slug: "", brand: "", model: "", year: "", city: "", budget: "", purchasePrice: "",
  tradeAmount: "", days: "", completedAt: "", task: "", found: "", result: "", photos: "",
  mainPhoto: "", isActive: false, sortOrder: "0",
};

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

/* ─── gallery ─── */

const GALLERY_FIELDS: FieldDef[] = [
  { key: "section", label: "Раздел", type: "select", options: GALLERY_SECTION_OPTIONS },
  { key: "title", label: "Название" },
  { key: "alt", label: "Alt-текст", full: true, help: "Обязательно: описание для доступности и SEO" },
  { key: "photo", label: "Фото", type: "image", full: true },
  { key: "prompt", label: "Промпт генерации", type: "textarea", full: true },
  { key: "isActive", label: "Активно", type: "checkbox" },
  { key: "sortOrder", label: "Порядок", type: "number" },
];
const GALLERY_KEYS = GALLERY_FIELDS.map(field => field.key);
const EMPTY_GALLERY = { section: "report", title: "", alt: "", photo: "", prompt: "", isActive: true, sortOrder: "0" };

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
  const [tab, setTab] = useState<SubTab>("cases");

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

      {tab === "cases" && (
        <EntityManager<AutoPodborCase>
          entity="cases"
          title="Кейсы"
          addLabel="Добавить кейс"
          fields={CASE_FIELDS}
          emptyForm={EMPTY_CASE}
          toForm={item => formValues(item as unknown as Record<string, unknown>, CASE_KEYS)}
          fromForm={form => normalizeFields(CASE_FIELDS, form)}
          columns={[
            { key: "title", label: "Кейс", render: item => (
              <div>
                <p className="font-medium text-white">{item.title}</p>
                <p className="text-[11px] text-slate-500">{[item.brand, item.model, item.year].filter(Boolean).join(" ")}</p>
              </div>
            ) },
            { key: "city", label: "Город" },
            { key: "budget", label: "Бюджет", render: item => item.budget ? `$${item.budget}` : "—" },
            { key: "tradeAmount", label: "Торг", render: item => item.tradeAmount ? `$${item.tradeAmount}` : "—" },
          ]}
          hint="Публикуются только реальные кейсы. Демо-кейс скрыт."
        />
      )}

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
          hint="Не публикуйте отзывы без подтверждения. Кнопка ●/○ — опубликовать/скрыть."
        />
      )}

      {tab === "gallery" && (
        <EntityManager<AutoPodborGalleryItem>
          entity="gallery"
          title="Галерея"
          addLabel="Добавить изображение"
          fields={GALLERY_FIELDS}
          emptyForm={EMPTY_GALLERY}
          toForm={item => formValues(item as unknown as Record<string, unknown>, GALLERY_KEYS)}
          fromForm={form => ({ ...normalizeFields(GALLERY_FIELDS, form), section: form.section || "report" })}
          columns={[
            { key: "photo", label: "Фото", render: item => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.photo} alt={item.alt} className="h-10 w-16 rounded object-cover" />
            ) },
            { key: "section", label: "Раздел", render: item =>
              GALLERY_SECTION_OPTIONS.find(option => option.value === item.section)?.label ?? item.section },
            { key: "title", label: "Название" },
          ]}
          hint="AI-изображения — только декоративные. Фото кейсов и отчётов — реальные."
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
