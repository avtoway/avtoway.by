"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AutoPodborCity, AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import { telegramUrl } from "@/shared/lib/social";
import type { SectionHeadingData } from "../lib/defaults";
import { phoneHref, viberHref, whatsappHref } from "../lib/defaults";
import { trackEvent } from "../lib/analytics";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

const input =
  "w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40";

const MESSENGERS = [
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "viber", label: "Viber" },
  { value: "call", label: "Звонок" },
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  messenger: string;
  city: string;
  budgetFrom: string;
  budgetTo: string;
  brand: string;
  model: string;
  comment: string;
  consent: boolean;
  company: string;
}

const EMPTY: FormState = {
  name: "", phone: "", email: "", messenger: "", city: "",
  budgetFrom: "", budgetTo: "", brand: "", model: "", comment: "",
  consent: false, company: "",
};

type Errors = Partial<Record<keyof FormState | "budget", string>>;

export default function LeadForm({
  heading,
  cities,
  tariffs,
  phone,
  telegram,
  whatsapp,
  viber,
  address,
  workingHours,
}: {
  heading: SectionHeadingData;
  cities: AutoPodborCity[];
  tariffs: AutoPodborTariff[];
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  viber?: string;
  address?: string;
  workingHours?: string;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [serviceSlug, setServiceSlug] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ slug?: string }>).detail;
      if (detail?.slug) setServiceSlug(detail.slug);
    };
    window.addEventListener("autopodbor:service", handler);
    return () => window.removeEventListener("autopodbor:service", handler);
  }, []);

  const set = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = key === "consent" ? (event.target as HTMLInputElement).checked : event.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const selectedTariff = tariffs.find(t => t.slug === serviceSlug) ?? null;

  function validate(): Errors {
    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = "Укажите имя (минимум 2 символа)";
    if (form.phone.replace(/\D/g, "").length < 7) next.phone = "Укажите телефон";
    if (!form.consent) next.consent = "Нужно согласие на обработку данных";
    if (form.budgetFrom && form.budgetTo && Number(form.budgetFrom) > Number(form.budgetTo)) {
      next.budget = "Бюджет «от» не может быть больше «до»";
    }
    return next;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;

    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setStatus("sending");
    setServerError("");

    const params = new URLSearchParams(window.location.search);

    const body = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      messenger: form.messenger || undefined,
      city: form.city || undefined,
      budgetFrom: form.budgetFrom ? Number(form.budgetFrom.replace(/\s/g, "")) : null,
      budgetTo: form.budgetTo ? Number(form.budgetTo.replace(/\s/g, "")) : null,
      brand: form.brand.trim() || undefined,
      model: form.model.trim() || undefined,
      serviceSlug: serviceSlug || undefined,
      comment: form.comment.trim() || undefined,
      consent: true,
      source: "form" as const,
      company: form.company,
      pageUrl: window.location.href.slice(0, 500),
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
    };

    try {
      const response = await fetch("/api/autopodbor/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.ok) {
        setStatus("success");
        trackEvent("lead_submit", {
          source: "form",
          service_slug: serviceSlug || undefined,
          city: form.city || undefined,
          budget: form.budgetFrom || undefined,
        });
      } else {
        setServerError(json.error ?? "Не удалось отправить заявку. Попробуйте позже.");
        setStatus("error");
      }
    } catch {
      setServerError("Нет связи с сервером. Попробуйте позже или позвоните нам.");
      setStatus("error");
    }
  }

  const tg = telegramUrl(telegram);
  const tel = phoneHref(phone);
  const wa = whatsappHref(whatsapp);
  const vb = viberHref(viber);

  return (
    <section id="lead" className="scroll-mt-24 py-20 pb-28 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-7">
            {status === "success" ? (
              <div role="status" className="flex h-full flex-col items-center justify-center py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                  <AutoIcon name="check" className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-white">Спасибо! Заявка у нас.</h3>
                <p className="mt-2 max-w-sm text-sm text-zinc-400">
                  Свяжемся с вами в течение 15 минут в рабочее время.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {tg && (
                    <a href={tg} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white hover:bg-primary-dark">
                      <AutoIcon name="telegram" className="h-4 w-4" /> Telegram
                    </a>
                  )}
                  {tel && (
                    <a href={tel} className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 px-5 text-sm font-medium text-zinc-300 hover:border-zinc-500 hover:text-white">
                      <AutoIcon name="phone" className="h-4 w-4" /> Позвонить
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setForm(EMPTY); setStatus("idle"); setServiceSlug(""); }}
                  className="mt-6 text-xs text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
                >
                  Отправить ещё одну заявку
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                {selectedTariff && (
                  <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-red-500/5 px-4 py-2.5 text-sm">
                    <span className="text-zinc-300">
                      Выбрано: <strong className="font-medium text-white">{selectedTariff.title}</strong>
                    </span>
                    <button type="button" onClick={() => setServiceSlug("")} className="text-zinc-500 hover:text-white" aria-label="Сбросить услугу">
                      <AutoIcon name="x" className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Имя *</span>
                    <input className={input} value={form.name} onChange={set("name")} maxLength={50} autoComplete="name" aria-invalid={!!errors.name} placeholder="Как к вам обращаться" />
                    {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Телефон *</span>
                    <input className={input} value={form.phone} onChange={set("phone")} maxLength={20} inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} placeholder="+375 (__) ___-__-__" />
                    {errors.phone && <span className="text-xs text-red-400">{errors.phone}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Email</span>
                    <input className={input} value={form.email} onChange={set("email")} maxLength={100} type="email" autoComplete="email" placeholder="you@example.com" />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Мессенджер</span>
                    <select className={input} value={form.messenger} onChange={set("messenger")}>
                      <option value="">Любой</option>
                      {MESSENGERS.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Город</span>
                    <select className={input} value={form.city} onChange={set("city")}>
                      <option value="">Выберите город</option>
                      {cities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
                      <option value="Другой">Другой</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Услуга</span>
                    <select className={input} value={serviceSlug} onChange={event => setServiceSlug(event.target.value)}>
                      <option value="">Подберите за меня</option>
                      {tariffs.map(tariff => <option key={tariff.slug} value={tariff.slug}>{tariff.title}</option>)}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Бюджет от, $</span>
                    <input className={input} value={form.budgetFrom} onChange={set("budgetFrom")} inputMode="numeric" maxLength={7} placeholder="10 000" />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Бюджет до, $</span>
                    <input className={input} value={form.budgetTo} onChange={set("budgetTo")} inputMode="numeric" maxLength={7} placeholder="20 000" aria-invalid={!!errors.budget} />
                    {errors.budget && <span className="text-xs text-red-400">{errors.budget}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Марка</span>
                    <input className={input} value={form.brand} onChange={set("brand")} maxLength={60} placeholder="Volkswagen" />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Модель</span>
                    <input className={input} value={form.model} onChange={set("model")} maxLength={60} placeholder="Passat B8" />
                  </label>
                </div>

                <label className="mt-3 flex flex-col gap-1.5">
                  <span className="text-xs text-zinc-500">Комментарий</span>
                  <textarea className={`${input} min-h-24 resize-y`} value={form.comment} onChange={set("comment")} maxLength={1000} placeholder="Что важно учесть: пробег, коробка, цвет, сроки…" />
                </label>

                {/* honeypot */}
                <div className="hidden" aria-hidden="true">
                  <label>
                    Company
                    <input tabIndex={-1} autoComplete="off" value={form.company} onChange={set("company")} />
                  </label>
                </div>

                <label className="mt-4 flex items-start gap-2.5 text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={set("consent")}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-red-600"
                    aria-invalid={!!errors.consent}
                  />
                  <span>
                    Согласен на обработку персональных данных и с{" "}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300">политикой конфиденциальности</Link>
                  </span>
                </label>
                {errors.consent && <p className="mt-1 text-xs text-red-400">{errors.consent}</p>}

                {serverError && (
                  <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-60"
                >
                  {status === "sending" ? "Отправляем…" : "Получить подборку"}
                  {status !== "sending" && <AutoIcon name="arrow-right" className="h-4 w-4" />}
                </button>

                <p className="mt-3 text-center text-[11px] text-zinc-600">
                  Ответим в течение 15 минут в рабочее время. Данные не передаём третьим лицам.
                </p>
              </form>
            )}
          </div>

          {/* Contacts */}
          <aside className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <p className="text-sm font-semibold text-white">Или свяжитесь напрямую</p>

            {tel && (
              <a href={tel} onClick={() => trackEvent("phone_click")} className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                <AutoIcon name="phone" className="h-5 w-5 text-primary" />
                <span>{phone}</span>
              </a>
            )}
            {tg && (
              <a href={tg} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("telegram_click")} className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                <AutoIcon name="telegram" className="h-5 w-5 text-sky-400" />
                <span>Telegram</span>
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("whatsapp_click")} className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                <AutoIcon name="whatsapp" className="h-5 w-5 text-green-400" />
                <span>WhatsApp</span>
              </a>
            )}
            {vb && (
              <a href={vb} className="flex items-center gap-3 rounded-xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                <AutoIcon name="viber" className="h-5 w-5 text-violet-400" />
                <span>Viber</span>
              </a>
            )}

            {(workingHours || address) && (
              <div className="mt-2 space-y-2 border-t border-zinc-800/70 pt-4 text-xs text-zinc-500">
                {workingHours && (
                  <p className="flex items-center gap-2">
                    <AutoIcon name="clock" className="h-4 w-4" /> {workingHours}
                  </p>
                )}
                {address && (
                  <p className="flex items-center gap-2">
                    <AutoIcon name="map-pin" className="h-4 w-4" /> {address}
                  </p>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
