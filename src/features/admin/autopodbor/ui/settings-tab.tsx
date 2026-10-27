"use client";

import { useCallback, useEffect, useState } from "react";
import type { AutoPodborSettings } from "@/entities/autopodbor/autopodbor.types";
import { useToast } from "@/shared/lib/toast-context";
import { getJson } from "../lib/api";

export default function SettingsTab() {  const [settings, setSettings] = useState<AutoPodborSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    const json = await getJson<AutoPodborSettings>("/api/autopodbor/settings");
    if (json?.ok && json.data) setSettings(json.data);
    else toast(json?.error ?? "Не удалось загрузить настройки", "error");
    setLoading(false);
  }, [toast]);

  // queueMicrotask: не вызываем setState синхронно в теле эффекта
  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  async function save(patch: Partial<AutoPodborSettings>) {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch("/api/autopodbor/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        toast(json.error ?? "Не удалось сохранить", "error");
        return;
      }
      setSettings(json.data as AutoPodborSettings);
      toast("Сохранено");
    } catch {
      toast("Нет связи с сервером", "error");
    } finally {
      setSaving(false);
    }
  }

  async function revalidate() {
    setRevalidating(true);
    try {
      const response = await fetch("/api/autopodbor/revalidate", { method: "POST" });
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.ok) toast("Кэш лендинга сброшен");
      else toast(json.error ?? "Не удалось сбросить кэш", "error");
    } catch {
      toast("Нет связи с сервером", "error");
    } finally {
      setRevalidating(false);
    }
  }

  if (loading || !settings) return <p className="text-sm text-slate-500">Загрузка настроек…</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Публикация</h3>

        <label className="flex items-start gap-3 rounded-lg border border-slate-800 p-4">
          <input
            type="checkbox"
            checked={settings.isActive}
            onChange={event => void save({ isActive: event.target.checked })}
            disabled={saving}
            className="mt-0.5 h-4 w-4 accent-red-600"
          />
          <span>
            <span className="block text-sm text-white">Лендинг опубликован</span>
            <span className="block text-xs text-slate-500">Если выключить — /services/inspection отдаст 404.</span>
          </span>
        </label>

        <label className="mt-3 flex items-start gap-3 rounded-lg border border-slate-800 p-4">
          <input
            type="checkbox"
            checked={settings.noindex}
            onChange={event => void save({ noindex: event.target.checked })}
            disabled={saving}
            className="mt-0.5 h-4 w-4 accent-red-600"
          />
          <span>
            <span className="block text-sm text-white">Закрыть от индексации</span>
            <span className="block text-xs text-slate-500">Добавляет noindex, страница остаётся доступной по ссылке.</span>
          </span>
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/services/inspection" target="_blank" rel="noopener noreferrer"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Открыть лендинг ↗
          </a>
          <button type="button" onClick={() => void revalidate()} disabled={revalidating}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:text-white disabled:opacity-60">
            {revalidating ? "Сброс…" : "Пересобрать кэш"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Защита заявок</h3>
        <ul className="space-y-3 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span><span className="text-white">Rate limit:</span> 5 заявок за 10 минут с одного IP (прокси).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span><span className="text-white">Honeypot:</span> скрытое поле company — боты отсекаются.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span><span className="text-white">Zod-валидация:</span> телефон, длины, бюджеты, даты.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✓</span>
            <span><span className="text-white">Цена услуги</span> берётся из БД, а не из клиента.</span>
          </li>
        </ul>

        <div className="mt-4 rounded-lg bg-slate-950/60 p-3 text-xs text-slate-500">
          Настройки самого лимита меняются в коде: <code>src/proxy.ts</code>. Для нескольких серверов нужен общий store (Redis).
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 lg:col-span-2">
        <h3 className="mb-2 text-base font-semibold text-white">Где что редактируется</h3>
        <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-2">
          <p><span className="text-white">Контент</span> — hero, эксперт, контакты, SEO, гарантия, дисклеймер, заголовки секций.</p>
          <p><span className="text-white">Тарифы</span> — цены, состав, группы, популярность.</p>
          <p><span className="text-white">Как работаем</span> — этапы, проверки, риски, преимущества, гарантии, trust-bar.</p>
          <p><span className="text-white">Доказательства</span> — отзывы и FAQ.</p>
          <p><span className="text-white">Заявки</span> — фильтры, статусы, ответственные, заметки, экспорт CSV.</p>
          <p><span className="text-white">Настройки</span> — публикация, индексация, кэш, защита.</p>
        </div>
      </div>
    </div>
  );
}
