"use client";

import { useState } from "react";
import Link from "next/link";
import { getLeadAttribution } from "@/shared/lib/lead-attribution";
import { trackLead } from "@/shared/lib/analytics";
import PhoneInput from "@/shared/ui/phone-input";

const input =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500";

export default function ExpressCheck() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [url, setUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const json = await fetch("/api/express-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          url,
          company: String(new FormData(event.currentTarget as HTMLFormElement).get("company") ?? ""),
          ...getLeadAttribution(),
        }),
      }).then(r => r.json());

      if (!json.ok) {
        setError(json.error ?? "Не удалось отправить. Попробуйте позже.");
        return;
      }
      setSent(true);
      trackLead("express_check", { url });
    } catch {
      setError("Ошибка соединения. Попробуйте позже.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="express-check" className="border-b border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-red-950/10 to-zinc-950 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 rounded-3xl border border-red-500/20 bg-zinc-900/40 p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-red-300">
              Бесплатно
            </span>
            <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Нашли авто на av.by?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              Вставьте ссылку на объявление — посмотрим фото, историю и признаки проблем.
              Скажем, стоит ли ехать на осмотр, и назовём вилку торга. Без навязывания.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-zinc-500">
              <li>• Проверяем объявления с av.by, kufar.by и abw.by</li>
              <li>• Отвечаем в рабочее время, обычно в течение часа</li>
              <li>• Это предварительная оценка, полная проверка — на осмотре</li>
            </ul>
            <Link
              href="/report/demo"
              className="mt-5 inline-flex h-10 items-center rounded-full border border-red-500/30 bg-red-500/10 px-4 text-xs font-medium text-red-200 transition hover:border-red-400/60 hover:text-white"
            >
              Посмотреть пример отчёта →
            </Link>
          </div>

          {sent ? (
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center">
              <p className="text-lg font-semibold text-white">Ссылка принята!</p>
              <p className="mt-2 text-sm text-emerald-200/80">
                Свяжемся с вами и скажем, стоит ли смотреть это авто.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" required className={input} />
              <PhoneInput value={phone} onChange={setPhone} required placeholder="Телефон" className={input} />
              <input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://av.by/... — ссылка на объявление"
                required
                inputMode="url"
                className={input}
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
              >
                {sending ? "Отправка..." : "Проверить объявление"}
              </button>
              <p className="text-[10px] leading-relaxed text-zinc-600">
                Нажимая кнопку, вы соглашаетесь с{" "}
                <a href="/privacy" className="underline hover:text-zinc-400">политикой обработки данных</a>.
              </p>
              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
