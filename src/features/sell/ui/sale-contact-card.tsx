"use client";

import { useState } from "react";
import type { SaleCar } from "@/entities/sell/sale-car.types";
import { SALE_STATUS_LABEL, SALE_STATUS_STYLE } from "@/shared/lib/car-dictionaries";
import { telegramUrl } from "@/shared/lib/social";
import { pricePair } from "../lib/filters";
import SaleRequestModal from "./sale-request-modal";

export default function SaleContactCard({
  car,
  usdRate,
  fallbackPhone,
  telegram,
  whatsapp,
}: {
  car: SaleCar;
  usdRate: number;
  fallbackPhone?: string;
  telegram?: string;
  whatsapp?: string;
}) {
  const [modal, setModal] = useState<null | "buy" | "trade_in">(null);
  const price = pricePair(car, usdRate, "BYN");
  const phone = car.contactPhone || fallbackPhone || "";
  const tg = telegramUrl(telegram);
  const wa = whatsapp?.replace(/\D/g, "");
  const message = encodeURIComponent(`Здравствуйте! Интересует ${car.title} (${car.year})`);

  return (
    <>
      <div className="sticky top-24 space-y-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Цена</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-white">{price.primary}</p>
              <p className="mt-1 text-sm text-zinc-400">{price.secondary}</p>
              <p className="mt-1 text-[10px] text-zinc-600">По курсу НБРБ на сегодня</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${SALE_STATUS_STYLE[car.status] ?? SALE_STATUS_STYLE.available}`}>
              {SALE_STATUS_LABEL[car.status] ?? car.status}
            </span>
          </div>

          {car.oldPriceUsd != null && car.oldPriceUsd > car.priceUsd && (
            <p className="mt-3 text-xs text-emerald-400">
              Цена снижена на ${(car.oldPriceUsd - car.priceUsd).toLocaleString("ru-RU")}{" "}
              <span className="text-zinc-600 line-through">${car.oldPriceUsd.toLocaleString("ru-RU")}</span>
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5 text-[10px]">
            {car.isNegotiable && <span className="rounded-md border border-zinc-700 bg-zinc-950/50 px-2 py-1 text-zinc-400">Торг у капота</span>}
            {car.allowExchange && <span className="rounded-md border border-sky-500/25 bg-sky-500/10 px-2 py-1 text-sky-300">Trade-in</span>}
            {car.allowCredit && <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-violet-300">Кредит / лизинг</span>}
          </div>

          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => setModal("buy")}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Записаться на осмотр / тест-драйв
            </button>
            {phone && (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950/50 px-4 text-sm font-medium text-zinc-200 transition hover:border-zinc-500">
                📞 {phone}
              </a>
            )}
          </div>

          {(tg || wa) && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {tg && (
                <a href={`${tg}?text=${message}`} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-xs font-medium text-sky-300 transition hover:bg-sky-500/15">
                  Telegram
                </a>
              )}
              {wa && (
                <a href={`https://wa.me/${wa}?text=${message}`} target="_blank" rel="noopener noreferrer" className="flex h-10 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/15">
                  WhatsApp
                </a>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4 text-xs text-zinc-500">
            <span>📍 {car.city}</span>
            {car.contactName && <span>Менеджер: {car.contactName}</span>}
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
            <button type="button" onClick={() => setModal("buy")} className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-white">
              Предложить свою цену
            </button>
            <button type="button" onClick={() => setModal("trade_in")} className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 hover:text-white">
              Предложить обмен (Trade-in)
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs leading-relaxed text-zinc-500">
          <p className="font-medium text-zinc-300">Почему АВТОWAY?</p>
          <p className="mt-2">Проверяем автомобиль до публикации: кузов, технику и документы. Показываем реальное состояние, а не только красивую картинку.</p>
        </div>
      </div>

      {/* Mobile sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-white">{price.primary}</p>
            <p className="truncate text-[10px] text-zinc-500">{price.secondary}</p>
          </div>
          {phone && (
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex h-11 shrink-0 items-center rounded-xl border border-zinc-700 px-4 text-sm text-zinc-200">Позвонить</a>
          )}
          <button type="button" onClick={() => setModal("buy")} className="flex h-11 shrink-0 items-center rounded-xl bg-red-600 px-4 text-sm font-medium text-white">Оставить заявку</button>
        </div>
      </div>

      <SaleRequestModal open={modal !== null} onClose={() => setModal(null)} car={car} usdRate={usdRate} type={modal ?? "buy"} />
    </>
  );
}
