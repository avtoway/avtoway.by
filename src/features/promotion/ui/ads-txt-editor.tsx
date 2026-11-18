"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";

/** Редактор /ads.txt: владелец вставляет строку рекламной сети без разработчика. */
export default function AdsTxtEditor() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/promotion/ads-txt")
      .then(response => response.json())
      .then(json => {
        if (json.ok) setContent(json.data.content ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/promotion/ads-txt", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await response.json();
      if (json.ok) toast("ads.txt сохранён");
      else toast(json.error ?? "Не удалось сохранить", "error");
    } catch {
      toast("Ошибка соединения", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h2 className="text-sm font-semibold text-white">Файл ads.txt</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Нужен для Google AdSense и Яндекс.Рекламы. Скопируйте строку из кабинета рекламной сети и вставьте сюда.
        Файл будет доступен по адресу <code className="text-slate-300">/ads.txt</code>.
      </p>

      <textarea
        value={loading ? "Загрузка..." : content}
        onChange={event => setContent(event.target.value)}
        rows={6}
        disabled={loading || saving}
        placeholder='google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0'
        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-red-500 disabled:opacity-60"
      />

      <div className="mt-3 flex items-center justify-between gap-3">
        <a
          href="/ads.txt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-400 underline transition hover:text-white"
        >
          Открыть /ads.txt
        </a>
        <button
          type="button"
          onClick={save}
          disabled={loading || saving}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}
