"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AutoPodborCity, AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import { telegramUrl } from "@/shared/lib/social";
import type { SectionHeadingData } from "../lib/defaults";
import { phoneHref } from "../lib/defaults";
import { tariffPrice } from "../lib/parse";
import { trackEvent } from "../lib/analytics";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

const TASKS = [
  { id: "check", label: "Проверить авто, которое я нашёл", slug: "single-check" },
  { id: "turnkey", label: "Найти авто под ключ", slug: "turnkey" },
  { id: "day", label: "Посмотреть несколько за день", slug: "day-expert" },
];

const BUDGETS = ["до 10 000 $", "10–20 000 $", "20–35 000 $", "35–50 000 $", "50 000 $+"];
const TIMEFRAMES = ["На этой неделе", "В течение месяца", "Пока присматриваюсь"];

const input =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/40";

export default function Quiz({
  heading,
  tariffs,
  cities,
  phone,
  telegram,
}: {
  heading: SectionHeadingData;
  tariffs: AutoPodborTariff[];
  cities: AutoPodborCity[];
  phone?: string;
  telegram?: string;
}) {
  const [step, setStep] = useState(0);
  const [task, setTask] = useState("");
  const [budget, setBudget] = useState("");
  const [city, setCity] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [name, setName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const recommended = useMemo(() => {
    const selected = TASKS.find(item => item.id === task);
    return tariffs.find(item => item.slug === selected?.slug) ?? tariffs.find(item => item.isPopular) ?? tariffs[0] ?? null;
  }, [task, tariffs]);

  function next() {
    setError("");
    if (step === 0) {
      if (!task) return setError("Выберите, что вам нужно");
      trackEvent("quiz_start");
    }
    if (step === 1 && !budget) return setError("Выберите бюджет");
    if (step === 2) {
      if (!city) return setError("Выберите город");
      if (!timeframe) return setError("Выберите срок");
    }
    trackEvent("quiz_step", { step: step + 1 });
    setStep(value => Math.min(3, value + 1));
  }

  function back() {
    setError("");
    setStep(value => Math.max(0, value - 1));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Укажите имя");
    if (contactPhone.replace(/\D/g, "").length < 7) return setError("Укажите телефон");
    if (!consent) return setError("Нужно согласие на обработку данных");
    if (status === "sending") return;

    setStatus("sending");
    setServerError("");

    const body = {
      name: name.trim(),
      phone: contactPhone.trim(),
      city,
      serviceSlug: recommended?.slug,
      consent: true,
      source: "quiz" as const,
      quiz: { task, budget, timeframe },
      company,
      pageUrl: window.location.href.slice(0, 500),
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
        trackEvent("quiz_complete", { service_slug: recommended?.slug, city });
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

  if (status === "success") {
    return (
      <section className="border-b border-zinc-800/50 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center" role="status">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
            <AutoIcon name="check" className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">Спасибо! Заявка у нас.</h2>
          <p className="mt-2 text-sm text-zinc-400">Свяжемся в течение 15 минут в рабочее время.</p>
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
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading {...heading} />

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-7">
          {/* progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
              <span>Шаг {step + 1} из 4</span>
              <span>{Math.round(((step + 1) / 4) * 100)}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${((step + 1) / 4) * 100}%` }} />
            </div>
          </div>

          <form onSubmit={submit}>
            {step === 0 && (
              <fieldset>
                <legend className="mb-4 text-lg font-semibold text-white">Что вам нужно?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TASKS.map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => { setTask(item.id); setError(""); }}
                      aria-pressed={task === item.id}
                      className={`rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                        task === item.id
                          ? "border-primary/50 bg-red-500/10 text-white"
                          : "border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="mb-4 text-lg font-semibold text-white">Какой бюджет?</legend>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map(value => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => { setBudget(value); setError(""); }}
                      aria-pressed={budget === value}
                      className={`rounded-full border px-4 py-2.5 text-sm transition ${
                        budget === value
                          ? "border-primary/50 bg-red-500/10 text-white"
                          : "border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset>
                <legend className="mb-4 text-lg font-semibold text-white">Где и когда?</legend>
                <label className="mb-4 flex flex-col gap-1.5">
                  <span className="text-xs text-zinc-500">Город</span>
                  <select className={input} value={city} onChange={event => setCity(event.target.value)}>
                    <option value="">Выберите город</option>
                    {cities.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                    <option value="Другой">Другой</option>
                  </select>
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIMEFRAMES.map(value => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => { setTimeframe(value); setError(""); }}
                      aria-pressed={timeframe === value}
                      className={`rounded-full border px-4 py-2.5 text-sm transition ${
                        timeframe === value
                          ? "border-primary/50 bg-red-500/10 text-white"
                          : "border-zinc-800 bg-zinc-950/40 text-zinc-300 hover:border-zinc-600"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 3 && (
              <fieldset>
                <legend className="mb-4 text-lg font-semibold text-white">Куда отправить подборку?</legend>

                {recommended && (
                  <div className="mb-5 rounded-xl border border-primary/30 bg-red-500/5 p-4">
                    <p className="text-[11px] uppercase tracking-wide text-primary">Рекомендуем</p>
                    <p className="mt-1 font-semibold text-white">{recommended.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-400">
                      {tariffPrice(recommended) ?? "по запросу"}
                      {recommended.duration ? ` · ${recommended.duration}` : ""}
                    </p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Имя *</span>
                    <input className={input} value={name} onChange={event => setName(event.target.value)} maxLength={50} autoComplete="name" />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs text-zinc-500">Телефон *</span>
                    <input className={input} value={contactPhone} onChange={event => setContactPhone(event.target.value)} maxLength={20} inputMode="tel" autoComplete="tel" placeholder="+375 (__) ___-__-__" />
                  </label>
                </div>

                <div className="hidden" aria-hidden="true">
                  <label>
                    Company
                    <input tabIndex={-1} autoComplete="off" value={company} onChange={event => setCompany(event.target.value)} />
                  </label>
                </div>

                <label className="mt-4 flex items-start gap-2.5 text-xs text-zinc-400">
                  <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
                  <span>
                    Согласен на обработку персональных данных и с{" "}
                    <Link href="/privacy" className="text-blue-400 hover:text-blue-300">политикой конфиденциальности</Link>
                  </span>
                </label>
              </fieldset>
            )}

            {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
            {serverError && (
              <p role="alert" className="mt-3 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                {serverError}
              </p>
            )}

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-zinc-700 px-5 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:opacity-40"
              >
                Назад
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary-dark"
                >
                  Далее
                  <AutoIcon name="arrow-right" className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-60"
                >
                  {status === "sending" ? "Отправляем…" : "Оставить заявку"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
