"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";
import type { AnalyticsOverview, AnalyticsSettings } from "@/entities/analytics/analytics.types";

type Tab = "overview" | "settings" | "seo";

const input = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";
const label = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500";

const EMPTY_SETTINGS: AnalyticsSettings = {
  gaId: "",
  ymId: "",
  ymWebvisor: true,
  googleVerification: "",
  yandexVerification: "",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  noindex: false,
};

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [settings, setSettings] = useState<AnalyticsSettings>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function loadSettings() {
    const json = await fetch("/api/analytics/settings", { cache: "no-store" }).then(response => response.json());
    if (json.ok) setSettings(json.data);
  }

  async function loadOverview(period: number) {
    const json = await fetch(`/api/analytics/overview?days=${period}`, { cache: "no-store" }).then(response => response.json());
    if (json.ok) setOverview(json.data);
    setLoading(false);
  }

  useEffect(() => {
    queueMicrotask(() => { void loadSettings(); });
  }, []);

  useEffect(() => {
    queueMicrotask(() => { void loadOverview(days); });
  }, [days]);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/analytics/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await response.json();
      if (json.ok) {
        setSettings(json.data);
        toast("Настройки аналитики сохранены");
      } else {
        toast(json.error ?? "Не удалось сохранить", "error");
      }
    } catch {
      toast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }

  const maxDay = useMemo(() => Math.max(1, ...(overview?.byDay.map(day => day.count) ?? [1])), [overview]);
  const maxSource = useMemo(() => Math.max(1, ...(overview?.bySource.map(item => item.count) ?? [1])), [overview]);
  const maxService = useMemo(() => Math.max(1, ...(overview?.byService.map(item => item.count) ?? [1])), [overview]);

  const seoChecks = [
    { label: "Google Analytics 4", ok: Boolean(settings.gaId), hint: settings.gaId || "Укажите Measurement ID" },
    { label: "Яндекс.Метрика", ok: Boolean(settings.ymId), hint: settings.ymId || "Укажите номер счётчика" },
    { label: "Google Search Console", ok: Boolean(settings.googleVerification), hint: settings.googleVerification || "Добавьте verification-код" },
    { label: "Яндекс.Вебмастер", ok: Boolean(settings.yandexVerification), hint: settings.yandexVerification || "Добавьте verification-код" },
    { label: "SEO-заголовок", ok: Boolean(settings.seoTitle), hint: settings.seoTitle || "Используется стандартный" },
    { label: "SEO-описание", ok: Boolean(settings.seoDescription), hint: settings.seoDescription || "Используется стандартное" },
    { label: "Open Graph", ok: Boolean(settings.ogImage), hint: settings.ogImage || "Добавьте URL изображения" },
    { label: "Индексация открыта", ok: !settings.noindex, hint: settings.noindex ? "Сайт закрыт от индексации" : "Сайт открыт" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Аналитика и SEO</h1>
          <p className="mt-0.5 text-sm text-slate-500">Счётчики, поисковые системы, цели и статистика заявок с сайта.</p>
        </div>
        <select value={days} onChange={event => setDays(Number(event.target.value))} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
          <option value={7}>7 дней</option>
          <option value={30}>30 дней</option>
          <option value={90}>90 дней</option>
        </select>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-800">
        {([
          ["overview", "Сводка"],
          ["settings", "Подключение"],
          ["seo", "SEO-проверка"],
        ] as Array<[Tab, string]>).map(([value, title]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2 text-sm transition ${tab === value ? "border-red-500 text-white" : "border-transparent text-slate-400 hover:text-white"}`}
          >
            {title}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["Всего заявок", overview?.total ?? 0, "text-white"],
              ["Новые", overview?.newCount ?? 0, "text-blue-300"],
              ["В работе", overview?.inWorkCount ?? 0, "text-amber-300"],
              ["Завершено", overview?.doneCount ?? 0, "text-emerald-300"],
            ].map(([title, value, tone]) => (
              <div key={String(title)} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{title}</p>
                <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Заявки по дням</h2>
              <span className="text-[10px] text-slate-500">за {overview?.days ?? days} дней</span>
            </div>
            {loading ? <p className="text-sm text-slate-500">Загрузка...</p> : (
              <div className="flex h-44 items-end gap-1 overflow-x-auto border-b border-slate-800 pb-2">
                {(overview?.byDay ?? []).map(day => (
                  <div key={day.date} className="group flex h-full min-w-[10px] flex-1 flex-col justify-end" title={`${day.label}: ${day.count}`}>
                    <span className="mb-1 hidden text-center text-[9px] text-slate-400 group-hover:block">{day.count}</span>
                    <div className="w-full rounded-t bg-red-500/70 transition group-hover:bg-red-400" style={{ height: `${Math.max(3, (day.count / maxDay) * 100)}%` }} />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex justify-between text-[10px] text-slate-600">
              <span>{overview?.byDay[0]?.label}</span>
              <span>{overview?.byDay[overview.byDay.length - 1]?.label}</span>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <h2 className="mb-4 text-sm font-semibold text-white">Источники</h2>
              {overview?.bySource.length ? overview.bySource.map(item => (
                <div key={item.key} className="mb-3">
                  <div className="mb-1 flex justify-between text-xs"><span className="text-slate-300">{item.label}</span><span className="text-slate-500">{item.count}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-red-500/70" style={{ width: `${(item.count / maxSource) * 100}%` }} /></div>
                </div>
              )) : <p className="text-xs text-slate-500">Заявок пока нет.</p>}
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <h2 className="mb-4 text-sm font-semibold text-white">Услуги</h2>
              {overview?.byService.length ? overview.byService.map(item => (
                <div key={item.key} className="mb-3">
                  <div className="mb-1 flex justify-between gap-3 text-xs"><span className="truncate text-slate-300">{item.label}</span><span className="shrink-0 text-slate-500">{item.count}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500/70" style={{ width: `${(item.count / maxService) * 100}%` }} /></div>
                </div>
              )) : <p className="text-xs text-slate-500">Заявок пока нет.</p>}
            </section>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <h2 className="mb-3 text-sm font-semibold text-white">UTM-метки</h2>
              {overview?.byUtm.length ? (
                <div className="space-y-2">
                  {overview.byUtm.map((item, index) => (
                    <div key={`${item.source}-${item.medium}-${item.campaign}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/50 px-3 py-2 text-xs">
                      <div className="min-w-0">
                        <p className="truncate text-slate-300">{item.source || "—"} / {item.medium || "—"}</p>
                        <p className="truncate text-[10px] text-slate-600">{item.campaign || "без кампании"}</p>
                      </div>
                      <span className="shrink-0 text-slate-400">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-500">UTM-меток пока нет.</p>}
            </section>

            <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <h2 className="mb-3 text-sm font-semibold text-white">Страницы заявок</h2>
              {overview?.topPages.length ? overview.topPages.map(item => (
                <div key={item.page} className="flex items-center justify-between gap-3 border-b border-slate-800/50 py-2 text-xs last:border-0">
                  <span className="truncate text-slate-400">{item.page}</span>
                  <span className="shrink-0 text-slate-500">{item.count}</span>
                </div>
              )) : <p className="text-xs text-slate-500">Данных пока нет.</p>}
            </section>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-800 p-4">
            <h2 className="mb-1 text-sm font-semibold text-white">Счётчики</h2>
            <p className="mb-4 text-xs text-slate-500">Скрипты подключаются только на публичной части сайта, не в админке.</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <label>
                <span className={label}>Google Analytics 4 — Measurement ID</span>
                <input value={settings.gaId} onChange={event => setSettings({ ...settings, gaId: event.target.value })} placeholder="G-XXXXXXXXXX" className={input} />
                <span className="mt-1 block text-[10px] text-slate-600">Например: G-ABC123DEF4</span>
              </label>
              <label>
                <span className={label}>Яндекс.Метрика — номер счётчика</span>
                <input value={settings.ymId} onChange={event => setSettings({ ...settings, ymId: event.target.value })} placeholder="12345678" className={input} />
                <span className="mt-1 block text-[10px] text-slate-600">Только цифры</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">
                <input type="checkbox" checked={settings.ymWebvisor} onChange={event => setSettings({ ...settings, ymWebvisor: event.target.checked })} />
                Вебвизор Яндекс.Метрики
              </label>
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-[10px] leading-relaxed text-slate-500">
                <p>Счётчики начнут работать после сохранения и обновления страницы. В dev-режиме изменения применяются сразу, в production — после ревалидации.</p>
                <p className="mt-2">В Яндекс.Метрике создайте цели: <span className="text-slate-300">lead_submit</span>, <span className="text-slate-300">phone_click</span>, <span className="text-slate-300">whatsapp_click</span>, <span className="text-slate-300">telegram_click</span>, <span className="text-slate-300">viber_click</span>.</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 p-4">
            <h2 className="mb-1 text-sm font-semibold text-white">Поисковые системы</h2>
            <p className="mb-4 text-xs text-slate-500">Коды подтверждения прав на сайт. Добавляются в meta-теги.</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <label>
                <span className={label}>Google Search Console</span>
                <input value={settings.googleVerification} onChange={event => setSettings({ ...settings, googleVerification: event.target.value })} placeholder="HTML-тег или verification-код" className={input} />
              </label>
              <label>
                <span className={label}>Яндекс.Вебмастер</span>
                <input value={settings.yandexVerification} onChange={event => setSettings({ ...settings, yandexVerification: event.target.value })} placeholder="yandex-verification код" className={input} />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">Google Search Console ↗</a>
              <a href="https://webmaster.yandex.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">Яндекс.Вебмастер ↗</a>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 p-4">
            <h2 className="mb-1 text-sm font-semibold text-white">SEO-настройки сайта</h2>
            <p className="mb-4 text-xs text-slate-500">Используются как значения по умолчанию для главной и страниц без собственных метаданных.</p>
            <div className="grid gap-4 lg:grid-cols-2">
              <label>
                <span className={label}>SEO-заголовок по умолчанию</span>
                <input value={settings.seoTitle} onChange={event => setSettings({ ...settings, seoTitle: event.target.value })} placeholder="АВТОWAY — автомобильные услуги в Минске" className={input} />
              </label>
              <label>
                <span className={label}>OG-изображение</span>
                <input value={settings.ogImage} onChange={event => setSettings({ ...settings, ogImage: event.target.value })} placeholder="/images/og-default.jpg или https://..." className={input} />
              </label>
              <label className="lg:col-span-2">
                <span className={label}>SEO-описание по умолчанию</span>
                <textarea rows={3} value={settings.seoDescription} onChange={event => setSettings({ ...settings, seoDescription: event.target.value })} className={input} />
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-red-900/40 bg-red-950/10 px-3 py-2 text-sm text-red-300">
                <input type="checkbox" checked={settings.noindex} onChange={event => setSettings({ ...settings, noindex: event.target.checked })} />
                Закрыть весь сайт от индексации (noindex)
              </label>
            </div>
          </section>

          <div className="sticky bottom-4 flex justify-end rounded-xl border border-slate-800 bg-slate-950/90 p-3 backdrop-blur">
            <button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {saving ? "Сохранение..." : "Сохранить настройки"}
            </button>
          </div>
        </div>
      )}

      {tab === "seo" && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-600"><p className="text-xs text-slate-500">Sitemap</p><p className="mt-1 text-sm font-medium text-white">/sitemap.xml ↗</p></a>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-600"><p className="text-xs text-slate-500">Robots</p><p className="mt-1 text-sm font-medium text-white">/robots.txt ↗</p></a>
            <a href="https://metrika.yandex.ru/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-600"><p className="text-xs text-slate-500">Метрика</p><p className="mt-1 text-sm font-medium text-white">Открыть ↗</p></a>
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-slate-600"><p className="text-xs text-slate-500">Google Analytics</p><p className="mt-1 text-sm font-medium text-white">Открыть ↗</p></a>
          </div>

          <section className="rounded-xl border border-slate-800 p-4">
            <h2 className="mb-4 text-sm font-semibold text-white">SEO-чеклист</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {seoChecks.map(check => (
                <div key={check.label} className="flex items-start gap-3 rounded-lg bg-slate-900/50 p-3">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] ${check.ok ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{check.ok ? "✓" : "!"}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200">{check.label}</p>
                    <p className="truncate text-[10px] text-slate-500">{check.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 p-4 text-xs leading-relaxed text-slate-500">
            <h2 className="mb-2 text-sm font-semibold text-white">Что уже работает на сайте</h2>
            <p>• Sitemap и robots.txt генерируются автоматически.</p>
            <p>• Canonical, Open Graph и Twitter Cards настроены.</p>
            <p>• JSON-LD: Organization, BreadcrumbList, Service, FAQ, JobPosting.</p>
            <p>• Метаданные услуг, партнёров, вакансий и автомобилей формируются из БД.</p>
            <p className="mt-2">После добавления счётчиков отправьте sitemap в Google Search Console и Яндекс.Вебмастер.</p>
          </section>
        </div>
      )}
    </div>
  );
}
