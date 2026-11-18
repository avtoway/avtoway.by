"use client";

import { useState } from "react";
import { getLeadAttribution } from "@/shared/lib/lead-attribution";
import { trackLead } from "@/shared/lib/analytics";
import ConsentNote from "@/shared/ui/consent-note";
import PhoneInput from "@/shared/ui/phone-input";
import { IconArrowRight, IconCheckCircle, IconTelegram } from "@/shared/ui/icons";

interface LeadFormSectionProps {
  services: { slug: string; title: string }[];
  phone?: string;
  telegram?: string;
}

const inputCls =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30";

export default function LeadFormSection({ services, phone, telegram }: LeadFormSectionProps) {
  const [name, setName] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [serviceSlug, setServiceSlug] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim() || !phoneValue.trim()) {
      setStatus("error");
      setError("Укажите имя и телефон — так мы сможем ответить.");
      return;
    }

    setStatus("sending");
    setError("");

    const serviceTitle = services.find(service => service.slug === serviceSlug)?.title;
    const company = String(new FormData(event.currentTarget as HTMLFormElement).get("company") ?? "");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneValue.trim(),
          message: comment.trim() || `Заявка с главной${serviceTitle ? `: ${serviceTitle}` : ""}`,
          company,
          source: "home",
          serviceSlug: serviceSlug || "home",
          ...getLeadAttribution(),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus("sent");
        trackLead("home", { service: serviceSlug || "home" });
        setName("");
        setPhoneValue("");
        setServiceSlug("");
        setComment("");
      } else {
        setStatus("error");
        setError(json.error ?? "Не удалось отправить заявку");
      }
    } catch {
      setStatus("error");
      setError("Не удалось отправить. Попробуйте ещё раз или позвоните.");
    }
  }

  return (
    <section
      id="request"
      className="relative scroll-mt-24 overflow-hidden border-t border-zinc-800/60 bg-zinc-950 py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_100%,rgba(239,68,68,0.10),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Заявка
          </span>

          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Расскажите, что нужно — <span className="text-primary">предложим решение</span>
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-400">
            Перезвоним, уточним детали и назовём цену. Без навязывания и скрытых условий.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              "Ответим по телефону или в мессенджере",
              "Скажем реальную цену до начала работы",
              "Работаем по договору",
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                <IconCheckCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
              >
                {phone}
              </a>
            )}
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
              >
                <IconTelegram className="size-4" />
                Telegram
              </a>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-2xl shadow-black/40 backdrop-blur sm:p-7">
          {status === "sent" ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 text-green-400">
                <IconCheckCircle className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">Заявка отправлена</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-400">
                Спасибо! Свяжемся с вами в ближайшее время.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-zinc-700 px-5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Отправить ещё
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Ваше имя *"
                  autoComplete="name"
                  className={inputCls}
                />
                <PhoneInput
                  value={phoneValue}
                  onChange={setPhoneValue}
                  placeholder="Телефон *"
                  className={inputCls}
                />
              </div>

              <select
                value={serviceSlug}
                onChange={event => setServiceSlug(event.target.value)}
                className={inputCls}
              >
                <option value="">Какая услуга интересует?</option>
                {services.map(service => (
                  <option key={service.slug} value={service.slug}>
                    {service.title}
                  </option>
                ))}
              </select>

              <textarea
                value={comment}
                onChange={event => setComment(event.target.value)}
                placeholder="Комментарий (необязательно)"
                rows={3}
                className={inputCls}
              />

              {status === "error" && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
              >
                {status === "sending" ? "Отправка..." : "Отправить заявку"}
                {status !== "sending" && <IconArrowRight />}
              </button>

              <ConsentNote className="text-center" />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
