"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { SaleCar } from "@/entities/sell/sale-car.types";
import {
  BODY_TYPE_LABEL,
  DRIVE_TYPE_LABEL,
  FUEL_LABEL,
  SALE_STATUS_LABEL,
  SALE_STATUS_STYLE,
  TRANSMISSION_LABEL,
} from "@/shared/lib/car-dictionaries";
import type { SaleCurrency, SaleView } from "../lib/filters";
import { pricePair } from "../lib/filters";

const FALLBACK = "/images/placeholder-car.webp";

export default function SaleCard({
  car,
  usdRate,
  currency,
  view = "grid",
}: {
  car: SaleCar;
  usdRate: number;
  currency: SaleCurrency;
  view?: SaleView;
}) {
  const photos = car.photos.length > 0 ? car.photos : [car.mainPhoto ?? FALLBACK];
  const [photoIndex, setPhotoIndex] = useState(0);
  const safeIndex = Math.min(photoIndex, photos.length - 1);
  const price = pricePair(car, usdRate, currency);
  const discount = car.oldPriceUsd != null && car.oldPriceUsd > car.priceUsd
    ? car.oldPriceUsd - car.priceUsd
    : null;
  const engine = [
    car.engineVolume != null ? `${car.engineVolume.toFixed(1)} л` : null,
    car.enginePowerHp != null ? `${car.enginePowerHp} л.с.` : null,
    FUEL_LABEL[car.fuel] ?? car.fuel,
  ].filter(Boolean).join(", ");

  const isList = view === "list";

  return (
    <Link
      href={`/services/sell/${car.slug}`}
      className={`group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition duration-300 hover:border-zinc-600 hover:bg-zinc-900 ${
        isList ? "flex flex-col sm:flex-row" : "flex flex-col"
      }`}
    >
      <div
        className={`relative shrink-0 overflow-hidden bg-zinc-800 ${
          isList ? "aspect-[16/10] sm:aspect-auto sm:h-auto sm:min-h-[220px] sm:w-72" : "aspect-[16/10]"
        }`}
        onMouseLeave={() => setPhotoIndex(0)}
        onMouseMove={(event) => {
          if (photos.length < 2) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          setPhotoIndex(Math.min(4, Math.max(0, Math.floor(ratio * 5))));
        }}
      >
        <Image
          src={photos[safeIndex] ?? FALLBACK}
          alt={car.title}
          fill
          sizes={isList ? "(max-width: 640px) 100vw, 288px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${SALE_STATUS_STYLE[car.status] ?? SALE_STATUS_STYLE.available}`}>
            {SALE_STATUS_LABEL[car.status] ?? car.status}
          </span>
          {car.isInspected && (
            <span className="rounded-full border border-red-500/40 bg-red-500/20 px-2.5 py-1 text-[10px] font-semibold text-red-200 backdrop-blur-sm">
              Проверено АВТОWAY
            </span>
          )}
          {car.isFeatured && (
            <span className="rounded-full border border-amber-400/40 bg-amber-400/20 px-2.5 py-1 text-[10px] font-semibold text-amber-200 backdrop-blur-sm">
              Топ
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white/85">
          <span className="rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">📷 {photos.length}</span>
          <div className="flex items-center gap-2">
            {car.videoUrl && <span className="rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">▶ Видео</span>}
            {safeIndex === 4 && photos.length > 5 && (
              <span className="rounded-full bg-black/65 px-2 py-1 backdrop-blur-sm">+ ещё {photos.length - 5}</span>
            )}
          </div>
        </div>

        {photos.length > 1 && (
          <div className="absolute inset-x-3 bottom-9 flex gap-1">
            {photos.slice(0, 5).map((_, index) => (
              <span
                key={index}
                className={`h-0.5 flex-1 rounded-full transition ${index === safeIndex ? "bg-white" : "bg-white/25"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white transition group-hover:text-red-400 sm:text-lg">
              {car.title}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {car.year} г. · {car.mileageKm.toLocaleString("ru-RU")} км · {car.city}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-white sm:text-xl">{price.primary}</p>
            <p className="text-[11px] text-zinc-500">{price.secondary}</p>
            {discount != null && (
              <p className="mt-1 text-[10px] font-medium text-emerald-400">
                −${discount.toLocaleString("ru-RU")} <span className="text-zinc-600 line-through">${car.oldPriceUsd?.toLocaleString("ru-RU")}</span>
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-zinc-400">
          <span className="rounded-md bg-zinc-800/80 px-2 py-1">{TRANSMISSION_LABEL[car.transmission] ?? car.transmission}</span>
          {engine && <span className="rounded-md bg-zinc-800/80 px-2 py-1">{engine}</span>}
          <span className="rounded-md bg-zinc-800/80 px-2 py-1">{BODY_TYPE_LABEL[car.bodyType] ?? car.bodyType}</span>
          <span className="rounded-md bg-zinc-800/80 px-2 py-1">{DRIVE_TYPE_LABEL[car.driveType] ?? car.driveType}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
          {car.originalPaint && <span className="text-emerald-400/90">✓ В родной краске</span>}
          {car.noAccidents && <span className="text-emerald-400/90">✓ Без ДТП</span>}
          {car.serviceBook && <span className="text-emerald-400/90">✓ Сервисная история</span>}
          {car.allowExchange && <span className="text-sky-400/90">✓ Trade-in</span>}
        </div>

        {car.expertSummary && (
          <p className="mt-3 line-clamp-1 text-xs leading-relaxed text-zinc-500">
            «{car.expertSummary}»
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4 text-xs">
          <span className="text-zinc-500">📍 {car.city}</span>
          <span className="font-medium text-red-400 transition group-hover:translate-x-0.5">Подробнее →</span>
        </div>
      </div>
    </Link>
  );
}
