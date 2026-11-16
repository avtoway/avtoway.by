"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";

interface TelegramSettings {
  enabled: boolean;
  chatId: string;
  hasToken: boolean;
}

const input = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";
const label = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500";

export default function AdminNotificationsPage() {
  const [settings, setSettings] = useState<TelegramSettings>({ enabled: false, chatId: "", hasToken: false });
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const json = await fetch("/api/notifications/telegram", { cache: "no-store" }).then(r => r.json());
        if (json.ok) setSettings(json.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const json = await fetch("/api/notifications/telegram", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: settings.enabled,
          chatId: settings.chatId,
          ...(token.trim() ? { token } : {}),
        }),
      }).then(r => r.json());
      if (json.ok) {
        setSettings(json.data);
        setToken("");
        toast("Настройки Telegram сохранены");
      } else {
        toast(json.error ?? "Не удалось сохранить", "error");
      }
    } catch {
      toast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    try {
      const json = await fetch("/api/notifications/telegram", { method: "POST" }).then(r => r.json());
      if (json.ok) toast("Тестовое сообщение отправлено");
      else toast(json.error ?? "Не удалось отправить", "error");
    } catch {
      toast("Ошибка отправки", "error");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Уведомления о заявках</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Мгновенные сообщения в Telegram при каждой новой заявке с сайта.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : (
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-800 p-4">
            <h2 className="mb-1 text-sm font-semibold text-white">Telegram-бот</h2>
            <p className="mb-4 text-xs text-slate-500">
              Создайте бота у <span className="text-slate-300">@BotFather</span>, вставьте токен, добавьте бота в нужный чат
              или канал и укажите Chat ID. Токен хранится в БД в зашифрованном виде.
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
              <label>
                <span className={label}>Токен бота</span>
                <input
                  value={token}
                  onChange={event => setToken(event.target.value)}
                  type="password"
                  autoComplete="off"
                  placeholder={settings.hasToken ? "•••••••• (сохранён, оставьте пустым)" : "123456789:AA..."}
                  className={input}
                />
                <span className="mt-1 block text-[10px] text-slate-600">
                  {settings.hasToken ? "Токен уже сохранён. Пустое поле — не менять." : "Получите у @BotFather."}
                </span>
              </label>

              <label>
                <span className={label}>Chat ID / @канал</span>
                <input
                  value={settings.chatId}
                  onChange={event => setSettings({ ...settings, chatId: event.target.value })}
                  placeholder="-1001234567890 или @avtoway_channel"
                  className={input}
                />
                <span className="mt-1 block text-[10px] text-slate-600">
                  Узнать ID: напишите боту и откройте api.telegram.org/bot&lt;token&gt;/getUpdates
                </span>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={event => setSettings({ ...settings, enabled: event.target.checked })}
                />
                Включить уведомления о новых заявках
              </label>

              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-[10px] leading-relaxed text-slate-500">
                Уведомления отправляются по всем источникам: общие формы, лендинги, аренда, продажа и автоподбор.
                Ошибки отправки пишутся в журнал на странице «Мониторинг».
              </div>
            </div>
          </section>

          <div className="flex flex-wrap justify-end gap-3 rounded-xl border border-slate-800 bg-slate-950/90 p-3">
            <button
              type="button"
              onClick={() => void sendTest()}
              disabled={testing || !settings.hasToken}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white disabled:opacity-50"
            >
              {testing ? "Отправка..." : "Отправить тест"}
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
