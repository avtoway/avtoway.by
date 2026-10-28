"use client";

import { useState } from "react";
import Link from "next/link";
import LandingIcon from "./icon";

const BUTTONS: Record<string, string> = {
  red: "bg-primary hover:bg-primary-dark hover:shadow-primary/20",
  blue: "bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20",
  amber: "bg-amber-500 text-zinc-950 hover:bg-amber-400 hover:shadow-amber-500/20",
  emerald: "bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/20",
};

export default function LandingLeadForm({
  topic,
  title = "Оставьте заявку",
  description = "Перезвоним в рабочее время, уточним детали и назовём стоимость.",
  commentPlaceholder,
  submitLabel = "Отправить заявку",
  accent = "red",
  phone,
}: {
  topic: string;
  title?: string;
  description?: string;
  commentPlaceholder: string;
  submitLabel?: string;
  accent?: "red" | "blue" | "amber" | "emerald";
  phone?: string | null;
}) {
  const [name, setName] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phoneValue.trim()) {
      setStatus("error");
      setError("Укажите имя и телефон — мы перезвоним.");
      return;
    }

    setStatus("sending");
    setError("");
    try {
      const message = `Заявка: ${topic}.${comment.trim() ? ` ${comment.trim()}` : ""}`;
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phoneValue.trim(),
          message,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setStatus("error");
        setError(json.error ?? "Не удалось отправить заявку. Попробуйте ещё раз.");
        return;
      }
      setStatus("sent");
      setComment("");
    } catch {
      setStatus("error");
      setError("Нет связи с сервером. Попробуйте позже или позвоните нам.");
    }
  }

  const input =
    "w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500";

  return (
    <div id="lead" className="scroll-mt-24 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-950 p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Заявка</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{description}</p>
      </div>

      {status === "sent" ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
            <LandingIcon name="check" className="h-6 w-6" />
          </span>
          <p className="mt-4 text-lg font-semibold text-white">Заявка отправлена</p>
          <p className="mt-1 text-sm text-zinc-400">Мы свяжемся с вами, уточним детали и назовём стоимость.</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-5 text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
          >
            Отправить ещё одну заявку
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Как вас зовут *"
              className={input}
              autoComplete="name"
            />
            <input
              value={phoneValue}
              onChange={(event) => setPhoneValue(event.target.value)}
              placeholder="Телефон для связи *"
              className={input}
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={commentPlaceholder}
            rows={4}
            className={input}
          />

          {status === "error" && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={status === "sending"}
            className={`mt-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 ${BUTTONS[accent]}`}
          >
            {status === "sending" ? "Отправляем..." : submitLabel}
            {status !== "sending" && <LandingIcon name="arrow-right" className="h-4 w-4" />}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600">
            <span>Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.</span>
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="font-medium text-zinc-400 transition hover:text-white">
                {phone}
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
