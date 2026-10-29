"use client";

import { useState } from "react";
import Link from "next/link";
import LandingIcon from "@/features/service-landings/ui/icon";

const input =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500";

export default function VacancyApplyForm({
  vacancyTitle,
  contactPhone,
}: {
  vacancyTitle: string;
  contactPhone?: string | null;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || (!phone.trim() && !email.trim())) {
      setStatus("error");
      setError("Укажите имя и хотя бы один контакт — телефон или email.");
      return;
    }

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          message: `Отклик на вакансию «${vacancyTitle}».${message.trim() ? ` ${message.trim()}` : ""}`,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setStatus("error");
        setError(json.error ?? "Не удалось отправить отклик. Попробуйте ещё раз.");
        return;
      }
      setStatus("sent");
      setMessage("");
    } catch {
      setStatus("error");
      setError("Нет связи с сервером. Попробуйте позже или позвоните нам.");
    }
  }

  return (
    <div id="apply" className="scroll-mt-24 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-950 p-6 sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Отклик</p>
      <h2 className="mt-2 text-2xl font-bold text-white">Откликнуться на вакансию</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">
        Расскажите о себе и опыте. Если есть ссылка на резюме или портфолио — добавьте её в сообщение.
      </p>

      {status === "sent" ? (
        <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            <LandingIcon name="check" className="h-6 w-6" />
          </span>
          <p className="mt-4 text-lg font-semibold text-white">Отклик отправлен</p>
          <p className="mt-1 text-sm text-zinc-400">
            Мы свяжемся с вами, если опыт и задача совпадут. Спасибо за интерес к АВТОWAY.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-5 text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
          >
            Отправить ещё один отклик
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Как вас зовут *"
              autoComplete="name"
              className={input}
            />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Телефон"
              inputMode="tel"
              autoComplete="tel"
              className={input}
            />
          </div>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            autoComplete="email"
            className={input}
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Опыт, ссылка на резюме или портфолио, удобное время для звонка"
            rows={4}
            className={input}
          />

          {status === "error" && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 hover:bg-red-500 disabled:pointer-events-none disabled:opacity-60"
          >
            {status === "sending" ? "Отправляем..." : "Отправить отклик"}
            {status !== "sending" && <LandingIcon name="arrow-right" className="h-4 w-4" />}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600">
            <span>Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</span>
            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/[^\d+]/g, "")}`} className="font-medium text-zinc-400 transition hover:text-white">
                {contactPhone}
              </a>
            )}
          </div>
          <Link href="/privacy" className="text-[11px] text-zinc-700 underline decoration-zinc-800 underline-offset-4 transition hover:text-zinc-500">
            Политика конфиденциальности
          </Link>
        </form>
      )}
    </div>
  );
}
