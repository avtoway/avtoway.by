"use client";

import { useState } from "react";
import type { SaleRequestInput } from "@/entities/sell/sale-car.types";

const inputCls =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500";

export default function SaleRequestForm({
  type = "buy",
  carId,
  defaultOffer,
  compact = false,
  submitLabel,
  onSuccess,
}: {
  type?: SaleRequestInput["type"];
  carId?: string;
  defaultOffer?: number;
  compact?: boolean;
  submitLabel?: string;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carInfo, setCarInfo] = useState("");
  const [offerPrice, setOfferPrice] = useState(defaultOffer ? String(defaultOffer) : "");
  const [comment, setComment] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const needsCarInfo = type === "sell_own" || type === "trade_in";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/sell/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          carId: carId || undefined,
          clientName: name,
          clientPhone: phone,
          carInfo: carInfo || undefined,
          offerPrice: offerPrice ? Number(offerPrice.replace(/\s/g, "")) : undefined,
          comment: comment || undefined,
          company,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (!json.ok) {
        setError(json.error ?? "Не удалось отправить заявку. Попробуйте ещё раз.");
        return;
      }
      setSent(true);
      onSuccess?.();
    } catch {
      setError("Нет связи с сервером. Попробуйте позже или позвоните нам.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5 text-center">
        <p className="text-sm font-semibold text-emerald-300">Заявка отправлена</p>
        <p className="mt-1 text-xs leading-relaxed text-emerald-200/70">
          Мы свяжемся с вами в течение рабочего дня. Спасибо!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "space-y-2.5" : "space-y-3"}>
      <input
        type="text"
        name="company"
        value={company}
        onChange={event => setCompany(event.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className={compact ? "grid gap-2.5 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2"}>
        <input
          required
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Ваше имя"
          autoComplete="name"
          className={inputCls}
        />
        <input
          required
          value={phone}
          onChange={event => setPhone(event.target.value)}
          placeholder="Телефон"
          inputMode="tel"
          autoComplete="tel"
          className={inputCls}
        />
      </div>

      {needsCarInfo && (
        <input
          required
          value={carInfo}
          onChange={event => setCarInfo(event.target.value)}
          placeholder="Марка, модель, год и желаемая цена"
          className={inputCls}
        />
      )}

      {type === "buy" && (
        <input
          value={offerPrice}
          onChange={event => setOfferPrice(event.target.value)}
          placeholder="Ваша цена, $ (необязательно)"
          inputMode="numeric"
          className={inputCls}
        />
      )}

      <textarea
        value={comment}
        onChange={event => setComment(event.target.value)}
        placeholder={type === "buy" ? "Комментарий, удобное время осмотра" : "Коротко о вашем автомобиле"}
        rows={compact ? 2 : 3}
        className={`${inputCls} resize-none`}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
      >
        {sending ? "Отправляем..." : submitLabel ?? (type === "sell_own" ? "Оценить моё авто" : "Отправить заявку")}
      </button>
      <p className="text-[10px] leading-relaxed text-zinc-600">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
      </p>
    </form>
  );
}
