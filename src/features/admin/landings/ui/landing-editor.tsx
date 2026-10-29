"use client";

import { useState } from "react";
import type {
  LandingAccent,
  LandingContent,
  LandingSectionContent,
  ServiceLanding,
} from "@/entities/service-landing/service-landing.types";
import { useToast } from "@/shared/lib/toast-context";

const input = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";
const label = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500";
const accents: LandingAccent[] = ["red", "blue", "amber", "emerald"];

type ItemRecord = Record<string, unknown>;

function Field({
  title,
  value,
  onChange,
  placeholder,
  rows,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label>
      <span className={label}>{title}</span>
      {rows ? (
        <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={input} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={input} />
      )}
    </label>
  );
}

function AccentSelect({ value, onChange }: { value?: LandingAccent; onChange: (value: LandingAccent) => void }) {
  return (
    <label>
      <span className={label}>Акцент</span>
      <select value={value ?? "red"} onChange={(event) => onChange(event.target.value as LandingAccent)} className={input}>
        {accents.map((accent) => <option key={accent} value={accent}>{accent}</option>)}
      </select>
    </label>
  );
}

function newSection(type: LandingSectionContent["type"]): LandingSectionContent {
  const base = { id: `${type}-${Date.now()}`, type, badge: "", title: "Новый блок", subtitle: "", accent: "red" as LandingAccent };
  switch (type) {
    case "features":
      return { ...base, type, columns: 3, items: [{ icon: "check", title: "Заголовок", text: "Описание" }] } as unknown as LandingSectionContent;
    case "steps":
      return { ...base, type, columns: 4, items: [{ title: "Шаг", text: "Описание", meta: "" }] } as unknown as LandingSectionContent;
    case "prices":
      return { ...base, type, note: "", items: [{ title: "Услуга", price: "от 0 BYN", note: "" }] } as unknown as LandingSectionContent;
    case "directions":
      return { ...base, type, items: [{ country: "Страна", flag: "🌍", text: "Описание", meta: "срок", accent: "blue" as LandingAccent }] } as unknown as LandingSectionContent;
    case "audience":
      return { ...base, type, items: [{ icon: "users", eyebrow: "Аудитория", title: "Заголовок", text: "Описание", bullets: ["Пункт"], ctaLabel: "Оставить заявку", ctaHref: "#lead", accent: "blue" as LandingAccent }] } as unknown as LandingSectionContent;
    case "comparison":
      return {
        ...base,
        type,
        left: { eyebrow: "Самому", title: "Минусы", bullets: ["Пункт"], accent: "red" as LandingAccent },
        right: { eyebrow: "С нами", title: "Плюсы", bullets: ["Пункт"], accent: "blue" as LandingAccent },
      } as unknown as LandingSectionContent;
  }
}

function newItem(type: LandingSectionContent["type"]): ItemRecord {
  switch (type) {
    case "features": return { icon: "check", title: "Заголовок", text: "Описание" };
    case "steps": return { title: "Шаг", text: "Описание", meta: "" };
    case "prices": return { title: "Услуга", price: "от 0 BYN", note: "" };
    case "directions": return { country: "Страна", flag: "🌍", text: "Описание", meta: "срок", accent: "blue" };
    case "audience": return { icon: "users", eyebrow: "Аудитория", title: "Заголовок", text: "Описание", bullets: ["Пункт"], ctaLabel: "Оставить заявку", ctaHref: "#lead", accent: "blue" };
    default: return {};
  }
}

export default function LandingEditor({
  landing,
  onSaved,
}: {
  landing: ServiceLanding;
  onSaved: (landing: ServiceLanding) => void;
}) {
  const [form, setForm] = useState(landing);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const content = form.content;

  function updateContent(patch: Partial<LandingContent>) {
    setForm((prev) => ({ ...prev, content: { ...prev.content, ...patch } }));
  }

  function updateHero(patch: Partial<LandingContent["hero"]>) {
    setForm((prev) => ({ ...prev, content: { ...prev.content, hero: { ...prev.content.hero, ...patch } } }));
  }

  function updateSection(index: number, patch: Record<string, unknown>) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.map((section, sectionIndex) =>
          sectionIndex === index ? ({ ...section, ...patch } as LandingSectionContent) : section,
        ),
      },
    }));
  }

  function updateItem(sectionIndex: number, itemIndex: number, patch: Record<string, unknown>) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.map((section, currentIndex) => {
          if (currentIndex !== sectionIndex || section.type === "comparison") return section;
          const items = section.items as unknown as ItemRecord[];
          return { ...section, items: items.map((item, currentItemIndex) => currentItemIndex === itemIndex ? { ...item, ...patch } : item) } as unknown as LandingSectionContent;
        }),
      },
    }));
  }

  function addItem(sectionIndex: number) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.map((section, index) => {
          if (index !== sectionIndex || section.type === "comparison") return section;
          return { ...section, items: [...section.items, newItem(section.type)] } as unknown as LandingSectionContent;
        }),
      },
    }));
  }

  function removeItem(sectionIndex: number, itemIndex: number) {
    setForm((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        sections: prev.content.sections.map((section, index) => {
          if (index !== sectionIndex || section.type === "comparison") return section;
          const items = section.items as unknown as ItemRecord[];
          return { ...section, items: items.filter((_, currentItemIndex) => currentItemIndex !== itemIndex) } as unknown as LandingSectionContent;
        }),
      },
    }));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= content.sections.length) return;
    const next = [...content.sections];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    updateContent({ sections: next });
  }

  function updateFaq(index: number, patch: Partial<LandingContent["faq"][number]>) {
    updateContent({ faq: content.faq.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch(`/api/service-landings/${form.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seoTitle: form.seoTitle,
          seoDescription: form.seoDescription,
          ogTitle: form.ogTitle,
          ogDescription: form.ogDescription,
          content: form.content,
          isActive: form.isActive,
        }),
      });
      const json = await response.json();
      if (json.ok) {
        setForm(json.data);
        onSaved(json.data);
        toast("Контент лендинга сохранён");
      } else {
        toast(json.error ?? "Не удалось сохранить", "error");
      }
    } catch {
      toast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div>
          <p className="text-sm font-semibold text-white">/{form.slug}</p>
          <p className="text-xs text-slate-500">Последнее сохранение: {new Date(form.updatedAt).toLocaleString("ru-RU")}</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
            Опубликован
          </label>
          <a href={`/services/${form.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white">
            Открыть на сайте ↗
          </a>
          <button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-slate-800 p-4">
        <h2 className="mb-4 text-sm font-semibold text-white">SEO и метаданные</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field title="SEO-заголовок" value={form.seoTitle} onChange={(value) => setForm({ ...form, seoTitle: value })} />
          <Field title="SEO-описание" value={form.seoDescription} onChange={(value) => setForm({ ...form, seoDescription: value })} rows={3} />
          <Field title="OG-заголовок" value={form.ogTitle ?? ""} onChange={(value) => setForm({ ...form, ogTitle: value })} />
          <Field title="OG-описание" value={form.ogDescription ?? ""} onChange={(value) => setForm({ ...form, ogDescription: value })} rows={3} />
          <Field title="Schema.org — название услуги" value={content.schemaName} onChange={(value) => updateContent({ schemaName: value })} />
          <Field title="Schema.org — описание услуги" value={content.schemaDescription} onChange={(value) => updateContent({ schemaDescription: value })} rows={3} />
          {content.breadcrumbs.map((breadcrumb, index) => (
            <Field
              key={index}
              title={`Хлебные крошки ${index + 1}`}
              value={breadcrumb.label}
              onChange={(value) => updateContent({
                breadcrumbs: content.breadcrumbs.map((item, itemIndex) =>
                  itemIndex === index ? { ...item, label: value } : item,
                ),
              })}
            />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 p-4">
        <h2 className="mb-4 text-sm font-semibold text-white">Первый экран</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field title="Бейдж" value={content.hero.badge} onChange={(value) => updateHero({ badge: value })} />
          <Field title="Иконка" value={content.hero.icon} onChange={(value) => updateHero({ icon: value })} />
          <Field title="Заголовок — начало" value={content.hero.titleBefore} onChange={(value) => updateHero({ titleBefore: value })} />
          <Field title="Заголовок — акцент" value={content.hero.titleAccent} onChange={(value) => updateHero({ titleAccent: value })} />
          <Field title="Заголовок — продолжение" value={content.hero.titleAfter ?? ""} onChange={(value) => updateHero({ titleAfter: value })} />
          <Field title="Подзаголовок" value={content.hero.subtitle} onChange={(value) => updateHero({ subtitle: value })} rows={3} />
          <Field title="Кнопка 1" value={content.hero.primaryLabel} onChange={(value) => updateHero({ primaryLabel: value })} />
          <Field title="Кнопка 2" value={content.hero.secondaryLabel ?? ""} onChange={(value) => updateHero({ secondaryLabel: value })} />
          <Field title="Ссылка кнопки 2" value={content.hero.secondaryHref ?? ""} onChange={(value) => updateHero({ secondaryHref: value })} />
          <Field title="Подпись визуала" value={content.hero.visualLabel ?? ""} onChange={(value) => updateHero({ visualLabel: value })} />
          <Field title="Статус" value={content.hero.statusLabel ?? ""} onChange={(value) => updateHero({ statusLabel: value })} />
          <AccentSelect value={content.hero.accent} onChange={(value) => updateHero({ accent: value })} />
          <Field title="Чипсы (через запятую)" value={content.hero.chips.join(", ")} onChange={(value) => updateHero({ chips: value.split(",").map((item) => item.trim()).filter(Boolean) })} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {content.hero.stats.map((stat, index) => (
            <div key={index} className="rounded-lg border border-slate-800 p-3">
              <Field title={`Статистика ${index + 1} — значение`} value={stat.value} onChange={(value) => updateHero({ stats: content.hero.stats.map((item, itemIndex) => itemIndex === index ? { ...item, value } : item) })} />
              <div className="mt-2"><Field title="Подпись" value={stat.label} onChange={(value) => updateHero({ stats: content.hero.stats.map((item, itemIndex) => itemIndex === index ? { ...item, label: value } : item) })} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Секции страницы</h2>
          <select
            defaultValue=""
            onChange={(event) => {
              if (!event.target.value) return;
              updateContent({ sections: [...content.sections, newSection(event.target.value as LandingSectionContent["type"])] });
              event.target.value = "";
            }}
            className={input + " max-w-[220px]"}
          >
            <option value="">+ Добавить секцию</option>
            <option value="features">Сетка преимуществ</option>
            <option value="steps">Шаги</option>
            <option value="prices">Цены</option>
            <option value="directions">Направления</option>
            <option value="audience">Аудитории</option>
            <option value="comparison">Сравнение</option>
          </select>
        </div>

        <div className="space-y-4">
          {content.sections.map((section, sectionIndex) => (
            <div key={section.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-800 px-2 py-1 text-[10px] uppercase text-slate-400">{section.type}</span>
                  <span className="text-xs text-slate-500">{section.id}</span>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveSection(sectionIndex, -1)} className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-400">↑</button>
                  <button type="button" onClick={() => moveSection(sectionIndex, 1)} className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-400">↓</button>
                  <button type="button" onClick={() => updateContent({ sections: content.sections.filter((_, index) => index !== sectionIndex) })} className="rounded border border-red-900/60 px-2 py-1 text-xs text-red-400">Удалить</button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <Field title="ID / якорь" value={section.id} onChange={(value) => updateSection(sectionIndex, { id: value })} />
                <Field title="Бейдж" value={section.badge ?? ""} onChange={(value) => updateSection(sectionIndex, { badge: value })} />
                <Field title="Заголовок" value={section.title} onChange={(value) => updateSection(sectionIndex, { title: value })} />
                <Field title="Подзаголовок" value={section.subtitle ?? ""} onChange={(value) => updateSection(sectionIndex, { subtitle: value })} rows={2} />
                <AccentSelect value={section.accent} onChange={(value) => updateSection(sectionIndex, { accent: value })} />
                {(section.type === "features" || section.type === "steps") && (
                  <label>
                    <span className={label}>Колонки</span>
                    <select value={section.columns ?? 3} onChange={(event) => updateSection(sectionIndex, { columns: Number(event.target.value) })} className={input}>
                      {(section.type === "features" ? [2, 3, 4] : [3, 4, 5]).map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                )}
              </div>

              {section.type === "comparison" ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {(["left", "right"] as const).map((side) => {
                    const item = section[side];
                    return (
                      <div key={side} className="rounded-lg border border-slate-800 p-3">
                        <p className="mb-2 text-xs font-semibold text-slate-400">{side === "left" ? "Левая карточка" : "Правая карточка"}</p>
                        <Field title="Надзаголовок" value={item.eyebrow} onChange={(value) => updateSection(sectionIndex, { [side]: { ...item, eyebrow: value } })} />
                        <div className="mt-2"><Field title="Заголовок" value={item.title} onChange={(value) => updateSection(sectionIndex, { [side]: { ...item, title: value } })} /></div>
                        <div className="mt-2"><Field title="Пункты (по одному в строке)" value={item.bullets.join("\n")} onChange={(value) => updateSection(sectionIndex, { [side]: { ...item, bullets: value.split("\n").filter(Boolean) } })} rows={5} /></div>
                        <div className="mt-2"><AccentSelect value={item.accent} onChange={(value) => updateSection(sectionIndex, { [side]: { ...item, accent: value } })} /></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400">Элементы ({section.items.length})</p>
                    <button type="button" onClick={() => addItem(sectionIndex)} className="rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-300">+ Элемент</button>
                  </div>
                  {(section.items as unknown as ItemRecord[]).map((item, itemIndex) => (
                    <div key={itemIndex} className="rounded-lg border border-slate-800/80 bg-slate-900/30 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[11px] text-slate-500">Элемент {itemIndex + 1}</p>
                        <button type="button" onClick={() => removeItem(sectionIndex, itemIndex)} className="text-[11px] text-red-400">Удалить</button>
                      </div>
                      <div className="grid gap-2 lg:grid-cols-2">
                        {section.type === "features" && (
                          <>
                            <Field title="Иконка" value={String(item.icon ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { icon: value })} />
                            <Field title="Заголовок" value={String(item.title ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { title: value })} />
                            <div className="lg:col-span-2"><Field title="Текст" value={String(item.text ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { text: value })} rows={2} /></div>
                          </>
                        )}
                        {section.type === "steps" && (
                          <>
                            <Field title="Заголовок" value={String(item.title ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { title: value })} />
                            <Field title="Мета" value={String(item.meta ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { meta: value })} />
                            <div className="lg:col-span-2"><Field title="Текст" value={String(item.text ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { text: value })} rows={2} /></div>
                          </>
                        )}
                        {section.type === "prices" && (
                          <>
                            <Field title="Название" value={String(item.title ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { title: value })} />
                            <Field title="Цена" value={String(item.price ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { price: value })} />
                            <Field title="Единица" value={String(item.unit ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { unit: value })} />
                            <Field title="Бейдж" value={String(item.badge ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { badge: value })} />
                            <div className="lg:col-span-2"><Field title="Примечание" value={String(item.note ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { note: value })} rows={2} /></div>
                          </>
                        )}
                        {section.type === "directions" && (
                          <>
                            <Field title="Страна" value={String(item.country ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { country: value })} />
                            <Field title="Флаг / эмодзи" value={String(item.flag ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { flag: value })} />
                            <Field title="Срок" value={String(item.meta ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { meta: value })} />
                            <AccentSelect value={item.accent as LandingAccent} onChange={(value) => updateItem(sectionIndex, itemIndex, { accent: value })} />
                            <div className="lg:col-span-2"><Field title="Текст" value={String(item.text ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { text: value })} rows={2} /></div>
                          </>
                        )}
                        {section.type === "audience" && (
                          <>
                            <Field title="Иконка" value={String(item.icon ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { icon: value })} />
                            <Field title="Надзаголовок" value={String(item.eyebrow ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { eyebrow: value })} />
                            <Field title="Заголовок" value={String(item.title ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { title: value })} />
                            <Field title="Текст" value={String(item.text ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { text: value })} rows={2} />
                            <Field title="Кнопка" value={String(item.ctaLabel ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { ctaLabel: value })} />
                            <Field title="Ссылка" value={String(item.ctaHref ?? "")} onChange={(value) => updateItem(sectionIndex, itemIndex, { ctaHref: value })} />
                            <AccentSelect value={item.accent as LandingAccent} onChange={(value) => updateItem(sectionIndex, itemIndex, { accent: value })} />
                            <div className="lg:col-span-2"><Field title="Пункты (по одному в строке)" value={Array.isArray(item.bullets) ? item.bullets.join("\n") : ""} onChange={(value) => updateItem(sectionIndex, itemIndex, { bullets: value.split("\n").filter(Boolean) })} rows={4} /></div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(section.type === "prices") && (
                <div className="mt-3"><Field title="Примечание к ценам" value={String(section.note ?? "")} onChange={(value) => updateSection(sectionIndex, { note: value })} rows={2} /></div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">FAQ</h2>
          <button type="button" onClick={() => updateContent({ faq: [...content.faq, { question: "Новый вопрос", answer: "Ответ" }] })} className="rounded border border-slate-700 px-2.5 py-1 text-xs text-slate-300">+ Вопрос</button>
        </div>
        <div className="mb-4 grid gap-3 lg:grid-cols-2">
          <Field title="Бейдж" value={content.faqHeading.badge ?? ""} onChange={(value) => updateContent({ faqHeading: { ...content.faqHeading, badge: value } })} />
          <Field title="Заголовок" value={content.faqHeading.title} onChange={(value) => updateContent({ faqHeading: { ...content.faqHeading, title: value } })} />
          <Field title="Подзаголовок" value={content.faqHeading.subtitle ?? ""} onChange={(value) => updateContent({ faqHeading: { ...content.faqHeading, subtitle: value } })} />
          <AccentSelect value={content.faqHeading.accent} onChange={(value) => updateContent({ faqHeading: { ...content.faqHeading, accent: value } })} />
        </div>
        <div className="space-y-3">
          {content.faq.map((item, index) => (
            <div key={index} className="rounded-lg border border-slate-800 p-3">
              <div className="mb-2 flex justify-end">
                <button type="button" onClick={() => updateContent({ faq: content.faq.filter((_, itemIndex) => itemIndex !== index) })} className="text-[11px] text-red-400">Удалить</button>
              </div>
              <Field title="Вопрос" value={item.question} onChange={(value) => updateFaq(index, { question: value })} />
              <div className="mt-2"><Field title="Ответ" value={item.answer} onChange={(value) => updateFaq(index, { answer: value })} rows={3} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 p-4">
        <h2 className="mb-4 text-sm font-semibold text-white">CTA и форма заявки</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <Field title="CTA — заголовок" value={content.cta.title} onChange={(value) => updateContent({ cta: { ...content.cta, title: value } })} />
          <Field title="CTA — текст" value={content.cta.text} onChange={(value) => updateContent({ cta: { ...content.cta, text: value } })} rows={2} />
          <Field title="CTA — кнопка" value={content.cta.primaryLabel} onChange={(value) => updateContent({ cta: { ...content.cta, primaryLabel: value } })} />
          <AccentSelect value={content.cta.accent} onChange={(value) => updateContent({ cta: { ...content.cta, accent: value } })} />
          <Field title="Форма — тема" value={content.lead.topic} onChange={(value) => updateContent({ lead: { ...content.lead, topic: value } })} />
          <Field title="Форма — заголовок" value={content.lead.title} onChange={(value) => updateContent({ lead: { ...content.lead, title: value } })} />
          <Field title="Форма — описание" value={content.lead.description} onChange={(value) => updateContent({ lead: { ...content.lead, description: value } })} rows={2} />
          <Field title="Форма — placeholder" value={content.lead.commentPlaceholder} onChange={(value) => updateContent({ lead: { ...content.lead, commentPlaceholder: value } })} />
          <Field title="Форма — кнопка" value={content.lead.submitLabel} onChange={(value) => updateContent({ lead: { ...content.lead, submitLabel: value } })} />
          <AccentSelect value={content.lead.accent} onChange={(value) => updateContent({ lead: { ...content.lead, accent: value } })} />
          <Field title="Sticky-кнопка" value={content.stickyLabel} onChange={(value) => updateContent({ stickyLabel: value })} />
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <Field title="Блок перед формой — надзаголовок" value={content.leadPrep.eyebrow} onChange={(value) => updateContent({ leadPrep: { ...content.leadPrep, eyebrow: value } })} />
          <Field title="Блок перед формой — заголовок" value={content.leadPrep.title} onChange={(value) => updateContent({ leadPrep: { ...content.leadPrep, title: value } })} />
          <Field title="Блок перед формой — примечание" value={content.leadPrep.note} onChange={(value) => updateContent({ leadPrep: { ...content.leadPrep, note: value } })} rows={2} />
          <AccentSelect value={content.leadPrep.accent} onChange={(value) => updateContent({ leadPrep: { ...content.leadPrep, accent: value } })} />
          <div className="lg:col-span-2"><Field title="Пункты (по одному в строке)" value={content.leadPrep.bullets.join("\n")} onChange={(value) => updateContent({ leadPrep: { ...content.leadPrep, bullets: value.split("\n").filter(Boolean) } })} rows={4} /></div>
        </div>
      </section>

      <div className="sticky bottom-4 flex justify-end rounded-xl border border-slate-800 bg-slate-950/90 p-3 backdrop-blur">
        <button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
          {saving ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </div>
    </div>
  );
}
