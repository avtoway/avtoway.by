"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { SaleCar } from "@/entities/sell/sale-car.types";
import SaleRequestForm from "./sale-request-form";
import { pricePair } from "../lib/filters";

export default function SaleRequestModal({
  open,
  onClose,
  car,
  usdRate,
  type = "buy",
}: {
  open: boolean;
  onClose: () => void;
  car?: SaleCar;
  usdRate: number;
  type?: "buy" | "trade_in";
}) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const price = car ? pricePair(car, usdRate, "BYN") : null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Закрыть" />
      <div className="relative z-10 w-full max-w-lg overflow-y-auto rounded-t-3xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl sm:rounded-2xl sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-red-400">
              {type === "trade_in" ? "Обмен / Trade-in" : "Заявка на автомобиль"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {type === "trade_in" ? "Предложить обмен" : "Записаться на осмотр"}
            </h2>
            {car && (
              <p className="mt-1 text-sm text-zinc-400">
                {car.title}
                {price && <span className="text-zinc-500"> · {price.primary}</span>}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <SaleRequestForm type={type} carId={car?.id} />
      </div>
    </div>,
    document.body,
  );
}
