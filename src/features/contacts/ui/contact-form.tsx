"use client";

import { useState } from "react";
import { getLeadAttribution } from "@/shared/lib/lead-attribution";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setStatus("error");
      setError("Укажите имя и сообщение");
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
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
          source: "contacts",
          serviceSlug: "contacts",
          ...getLeadAttribution(),
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus("sent");
        setName(""); setPhone(""); setEmail(""); setMessage("");
      } else {
        setStatus("error");
        setError(json.error ?? "Ошибка отправки");
      }
    } catch {
      setStatus("error");
      setError("Не удалось отправить. Попробуйте ещё раз.");
    }
  }

  const inputCls = "w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition focus:border-red-500 placeholder:text-zinc-600";

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя *" className={inputCls} />
        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" className={inputCls} />
      </div>
      <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email (необязательно)" className={inputCls} />
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Что вас интересует? *" rows={4} className={inputCls} />

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "sent" && <p className="text-sm text-green-400">Спасибо! Ваша заявка отправлена, мы скоро свяжемся с вами.</p>}

      <button type="submit" disabled={status === "sending"}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/20 disabled:opacity-50">
        {status === "sending" ? "Отправка..." : "Отправить заявку"}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
      </button>
    </form>
  );
}
