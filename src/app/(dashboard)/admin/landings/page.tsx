"use client";

import { useEffect, useState } from "react";
import LandingEditor from "@/features/admin/landings/ui/landing-editor";
import type { ServiceLanding, ServiceLandingSummary } from "@/entities/service-landing/service-landing.types";

const TAB_LABELS: Record<string, string> = {
  truck: "Эвакуатор",
  import: "Автопригон",
  service: "Автосервис",
  moving: "Грузоперевозки",
};

export default function AdminLandingsPage() {
  const [items, setItems] = useState<ServiceLandingSummary[]>([]);
  const [slug, setSlug] = useState("");
  const [landing, setLanding] = useState<ServiceLanding | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadList() {
    const response = await fetch("/api/service-landings", { cache: "no-store" });
    const json = await response.json();
    if (json.ok) {
      setItems(json.data);
      if (!slug && json.data[0]) setSlug(json.data[0].slug);
    }
    setLoading(false);
  }

  async function loadLanding(nextSlug: string) {
    setLoading(true);
    const response = await fetch(`/api/service-landings/${nextSlug}`, { cache: "no-store" });
    const json = await response.json();
    if (json.ok) setLanding(json.data);
    else setLanding(null);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void loadList(); }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- switch selected landing
  useEffect(() => { if (slug) void loadLanding(slug); }, [slug]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Контент лендингов</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Тексты, преимущества, тарифы, FAQ и SEO-метаданные страниц услуг хранятся в базе данных.
        </p>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-800">
        {items.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setSlug(item.slug)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2 text-sm transition ${
              slug === item.slug ? "border-red-500 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {TAB_LABELS[item.slug] ?? item.slug}
            {!item.isActive && <span className="ml-2 text-[10px] text-slate-600">скрыт</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : landing ? (
        <LandingEditor
          key={landing.slug}
          landing={landing}
          onSaved={(updated) => {
            setLanding(updated);
            setItems((prev) => prev.map((item) => item.slug === updated.slug ? {
              ...item,
              seoTitle: updated.seoTitle,
              isActive: updated.isActive,
              updatedAt: updated.updatedAt,
            } : item));
          }}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-500">
          Контент лендинга не найден. Запустите сид или создайте запись в базе.
        </div>
      )}
    </div>
  );
}
