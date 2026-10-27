"use client";

import type { AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import EntityManager, { formValues, normalizeFields, type FieldDef } from "./entity-manager";
import { ICON_OPTIONS, TARIFF_GROUP_OPTIONS } from "../lib/options";

const FIELDS: FieldDef[] = [
  { key: "title", label: "Название", placeholder: "Разовый осмотр" },
  { key: "slug", label: "Slug", placeholder: "оставьте пустым — из названия", help: "Используется в ссылках и заявках" },
  { key: "groupName", label: "Группа", type: "select", options: TARIFF_GROUP_OPTIONS },
  { key: "price", label: "Цена, BYN", type: "number" },
  { key: "priceFrom", label: "Цена «от»", type: "checkbox" },
  { key: "duration", label: "Срок", placeholder: "2–3 часа" },
  { key: "unit", label: "Единица", placeholder: "за осмотр" },
  { key: "currency", label: "Валюта", placeholder: "BYN" },
  { key: "badge", label: "Бейдж", placeholder: "Чаще всего выбирают" },
  { key: "icon", label: "Иконка", type: "select", options: ICON_OPTIONS },
  { key: "ctaLabel", label: "Текст кнопки", placeholder: "Оставить заявку" },
  { key: "description", label: "Описание", type: "textarea", full: true },
  { key: "includes", label: "Что входит", type: "textarea", full: true, help: "По одному пункту в строке" },
  { key: "image", label: "Изображение", type: "image", full: true },
  { key: "isPopular", label: "Популярный", type: "checkbox" },
  { key: "isActive", label: "Активен", type: "checkbox" },
  { key: "sortOrder", label: "Порядок", type: "number" },
];

const KEYS = FIELDS.map(field => field.key);

const EMPTY = {
  title: "", slug: "", groupName: "rb", price: "", priceFrom: true, duration: "", unit: "",
  currency: "BYN", badge: "", icon: "check", ctaLabel: "Оставить заявку", description: "",
  includes: "", image: "", isPopular: false, isActive: true, sortOrder: "0",
};

export default function TariffsTab() {
  return (
    <EntityManager<AutoPodborTariff>
      entity="tariffs"
      title="Тарифы"
      addLabel="Добавить тариф"
      fields={FIELDS}
      emptyForm={EMPTY}
      toForm={item => formValues(item as unknown as Record<string, unknown>, KEYS)}
      fromForm={form => ({
        ...normalizeFields(FIELDS, form),
        groupName: form.groupName || "rb",
        currency: form.currency || "BYN",
        icon: form.icon || "check",
        ctaLabel: form.ctaLabel || "Оставить заявку",
      })}
      columns={[
        { key: "title", label: "Название", render: tariff => (
          <div>
            <p className="font-medium text-white">{tariff.title}</p>
            {tariff.badge && <p className="text-[11px] text-amber-400">{tariff.badge}</p>}
          </div>
        ) },
        { key: "groupName", label: "Группа", render: tariff =>
          TARIFF_GROUP_OPTIONS.find(option => option.value === tariff.groupName)?.label ?? tariff.groupName },
        { key: "price", label: "Цена", render: tariff =>
          tariff.price == null ? "—" : `${tariff.priceFrom ? "от " : ""}${tariff.price} ${tariff.currency}` },
        { key: "duration", label: "Срок" },
        { key: "isPopular", label: "Хит", render: tariff => tariff.isPopular ? "★" : "—" },
      ]}
      preview={form => {
        const price = String(form.price ?? "");
        return (
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            {Boolean(form.badge) && (
              <span className="mb-2 inline-block rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-400">{String(form.badge)}</span>
            )}
            <p className="font-semibold text-white">{String(form.title || "Название тарифа")}</p>
            <p className="mt-1 text-xl font-bold text-green-400">
              {price ? `${form.priceFrom ? "от " : ""}${price} ${String(form.currency || "BYN")}` : "Цена не указана"}
            </p>
            {Boolean(form.duration) && <p className="text-xs text-slate-500">{String(form.duration)}</p>}
            <p className="mt-2 line-clamp-3 text-xs text-slate-400">{String(form.description ?? "")}</p>
            <p className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-center text-xs text-white">{String(form.ctaLabel || "Оставить заявку")}</p>
          </div>
        );
      }}
    />
  );
}
