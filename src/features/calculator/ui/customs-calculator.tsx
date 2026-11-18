"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AGE_LABEL,
  ENGINE_LABEL,
  calculateCustoms,
  type CarAge,
  type EngineType,
} from "@/features/calculator/lib/customs";
import { getLeadAttribution } from "@/shared/lib/lead-attribution";
import { trackLead } from "@/shared/lib/analytics";
import ConsentNote from "@/shared/ui/consent-note";
import PhoneInput from "@/shared/ui/phone-input";
import { IconCheckCircle } from "@/shared/ui/icons";

const input =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500 focus:ring-1 focus:ring-red-500/30";

const money = (value: number) => `${value.toLocaleString("ru-RU")} BYN`;

export default function CustomsCalculator() {
  const [engine, setEngine] = useState<EngineType>("petrol");
  const [age, setAge] = useState<CarAge>("from3to5");
  const [volume, setVolume] = useState("1600");
  const [price, setPrice] = useState("12000");
  const [discount140, setDiscount140] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const result = useMemo(
    () =>
      calculateCustoms({
        engine,
        age,
        volumeCm3: Number(volume) || 0,
        priceEur: Number(price) || 0,
        discount140,
      }),
    [engine, age, volume, price, discount140],
  );

  const isElectric = engine === "electric";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setStatus("error");
      setError("Укажите имя и телефон — рассчитаем доставку под ключ.");
      return;
    }
    setStatus("sending");
    setError("");

    const message = [
      "Заявка с калькулятора растаможки:",
      `${ENGINE_LABEL[engine]}, ${AGE_LABEL[age]}`,
      isElectric ? "электромобиль" : `${volume} см³`,
      `стоимость ${price} EUR`,
      discount140 ? "льгота по Указу №140" : "без льготы",
      `предварительный итог ${result.totalByn} BYN`,
      comment.trim(),
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message,
          company: String(new FormData(event.currentTarget as HTMLFormElement).get("company") ?? ""),
          source: "customs_calculator",
          serviceSlug: "import",
          ...getLeadAttribution(),
        }),
      });
      const json = await response.json();
      if (json.ok) {
        setStatus("sent");
        trackLead("customs_calculator", { total: result.totalByn });
      } else {
        setStatus("error");
        setError(json.error ?? "Не удалось отправить заявку");
      }
    } catch {
      setStatus("error");
      setError("Ошибка соединения. Попробуйте ещё раз или позвоните.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:items-start">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-7">
        <h2 className="text-lg font-semibold text-white">Параметры автомобиля</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs text-zinc-400">Тип двигателя</span>
            <select value={engine} onChange={event => setEngine(event.target.value as EngineType)} className={input}>
              {(Object.keys(ENGINE_LABEL) as EngineType[]).map(value => (
                <option key={value} value={value}>{ENGINE_LABEL[value]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-zinc-400">Возраст авто</span>
            <select value={age} onChange={event => setAge(event.target.value as CarAge)} className={input}>
              {(Object.keys(AGE_LABEL) as CarAge[]).map(value => (
                <option key={value} value={value}>{AGE_LABEL[value]}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-zinc-400">Объём двигателя, см³</span>
            <input
              value={volume}
              onChange={event => setVolume(event.target.value.replace(/\D/g, "").slice(0, 5))}
              inputMode="numeric"
              disabled={isElectric}
              className={`${input} disabled:opacity-40`}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs text-zinc-400">Стоимость авто, EUR</span>
            <input
              value={price}
              onChange={event => setPrice(event.target.value.replace(/\D/g, "").slice(0, 7))}
              inputMode="numeric"
              className={input}
            />
          </label>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <input
            type="checkbox"
            checked={discount140}
            onChange={event => setDiscount140(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-red-500"
          />
          <span className="text-sm text-zinc-300">
            Льготная растаможка −50% (Указ №140)
            <span className="mt-0.5 block text-xs text-zinc-500">
              Скидка применяется к таможенной пошлине.
            </span>
          </span>
        </label>
      </div>

      <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/25 via-zinc-900/60 to-zinc-950 p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">Предварительный расчёт</p>

        <div className="mt-4 space-y-2.5 text-sm">
          <Row label="Таможенная пошлина" value={money(result.dutyByn)} hint={`≈ ${result.dutyEur.toLocaleString("ru-RU")} EUR`} />
          <Row label="Утильсбор" value={money(result.utilByn)} />
          <Row label="Таможенный сбор" value={money(result.feeByn)} />
          <div className="flex items-center justify-between border-t border-zinc-700 pt-3 text-base font-semibold text-white">
            <span>Итого</span>
            <span className="text-red-300">{money(result.totalByn)}</span>
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
          Расчёт ориентировочный: точную сумму подтверждает таможня с учётом курса, даты оформления и статуса
          автомобиля. Не является публичной офертой.
        </p>

        <a
          href="#customs-request"
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Рассчитать доставку под ключ
        </a>
      </div>

      <div id="customs-request" className="scroll-mt-24 lg:col-span-2">
        {status === "sent" ? (
          <div className="rounded-2xl border border-green-500/25 bg-green-500/10 p-6 text-center">
            <IconCheckCircle className="mx-auto size-7 text-green-400" />
            <p className="mt-3 text-lg font-semibold text-white">Заявка отправлена</p>
            <p className="mt-1 text-sm text-zinc-400">Свяжемся с вами и рассчитаем доставку под ключ.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
            <h3 className="text-base font-semibold text-white">Хотите пригнать авто под этот бюджет?</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Оставьте заявку — подберём варианты, посчитаем доставку и поможем с оформлением.
            </p>

            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input value={name} onChange={event => setName(event.target.value)} placeholder="Ваше имя *" autoComplete="name" className={input} />
              <PhoneInput value={phone} onChange={setPhone} placeholder="Телефон *" className={input} />
            </div>
            <textarea
              value={comment}
              onChange={event => setComment(event.target.value)}
              placeholder="Комментарий (необязательно)"
              rows={3}
              className={`${input} mt-3`}
            />

            {status === "error" && <p className="mt-3 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
            >
              {status === "sending" ? "Отправка..." : "Отправить заявку"}
            </button>
            <ConsentNote className="mt-3" />
          </form>
        )}

        <p className="mt-4 text-center text-xs text-zinc-600">
          Нужен осмотр перед покупкой?{" "}
          <Link href="/services/inspection" className="text-zinc-400 underline transition hover:text-white">
            Заказать автоподбор
          </Link>
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-400">
        {label}
        {hint && <span className="ml-1 text-[11px] text-zinc-600">{hint}</span>}
      </span>
      <span className="shrink-0 font-medium text-zinc-200">{value}</span>
    </div>
  );
}
