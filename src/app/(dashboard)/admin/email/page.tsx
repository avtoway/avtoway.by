"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/shared/lib/toat-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";

type Tab = "inbox" | "sent" | "settings";

interface InboxItem {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  textBody?: string;
  isRead: boolean;
  receivedAt: string;
  messageId?: string;
}

interface SentItem {
  id: string;
  to: string;
  subject: string;
  body: string;
  status: string;
  error?: string;
  inReplyTo?: string;
  sentAt: string;
}

interface SmtpForm {
  smtp_host: string; smtp_port: string; smtp_user: string; smtp_pass: string;
  smtp_from_name: string; smtp_from_email: string;
  imap_host: string; imap_port: string; imap_user: string; imap_pass: string;
}

const EMPTY_SMTP: SmtpForm = {
  smtp_host: "", smtp_port: "587", smtp_user: "", smtp_pass: "", smtp_from_name: "АВТОWAY", smtp_from_email: "",
  imap_host: "", imap_port: "993", imap_user: "", imap_pass: "",
};

export default function AdminEmailPage() {
  return <EmailClient />;
}

function EmailClient() {
  const [tab, setTab] = useState<Tab>("inbox");
  const { toast } = useToast();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Почта</h1>
          <p className="mt-0.5 text-sm text-slate-500">Полноценный почтовый ящик</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900/50 p-1">
          {([
            { id: "inbox" as Tab, label: "Входящие" },
            { id: "sent" as Tab, label: "Отправленные" },
            { id: "settings" as Tab, label: "Настройки" },
          ]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                tab === t.id ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {tab === "inbox" && <InboxTab toast={toast} />}
        {tab === "sent" && <SentTab />}
        {tab === "settings" && <SettingsTab toast={toast} />}
      </div>
    </div>
  );
}

/* ───── Inbox ───── */
function InboxTab({ toast }: { toast: (msg: string, type?: "error") => void }) {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<InboxItem | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [unread, setUnread] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [replyMode, setReplyMode] = useState<"reply" | "forward" | null>(null);
  const [replyForm, setReplyForm] = useState({ to: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const { confirm, dialog } = useConfirm();

  const load = useCallback(async () => {
    const res = await fetch(`/api/email/inbox?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}`);
    const j = await res.json();
    if (j.ok) { setItems(j.data.items); setUnread(j.data.unread); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load, search]);

  async function refresh() {
    setRefreshing(true);
    const res = await fetch("/api/email/refresh", { method: "POST" });
    const j = await res.json();
    if (j.ok && j.data.newCount > 0) toast(`Получено писем: ${j.data.newCount}`);
    if (j.data.error) toast(j.data.error, "error");
    await load();
    setRefreshing(false);
  }

  async function openEmail(item: InboxItem) {
    setSelected(item);
    setReplyMode(null);
    if (!item.isRead) {
      await fetch(`/api/email/inbox/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isRead: true } : i));
      setUnread(u => Math.max(0, u - 1));
    }
  }

  function startReply() {
    if (!selected) return;
    setReplyMode("reply");
    setReplyForm({ to: selected.from.replace(/<.*?>/, "").trim(), subject: `Re: ${selected.subject}`, body: `<br/><br/><blockquote style="border-left:2px solid #555;padding-left:12px;color:#888;">${selected.body}</blockquote>` });
  }

  function startForward() {
    if (!selected) return;
    setReplyMode("forward");
    setReplyForm({ to: "", subject: `Fwd: ${selected.subject}`, body: `<br/><br/>——— Пересланное сообщение ———<br/>${selected.body}` });
  }

  async function sendReply() {
    setSending(true);
    const res = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: replyForm.to, subject: replyForm.subject, body: replyForm.body, inReplyTo: selected?.messageId ?? undefined }),
    });
    const j = await res.json();
    if (j.ok) { setReplyMode(null); toast("Отправлено"); }
    else toast(j.error ?? "Ошибка", "error");
    setSending(false);
  }

  async function deleteSelected() {
    const ids = selected ? [selected.id] : [...checked];
    if (ids.length === 0) return;
    const ok = await confirm({ title: "Удалить письма?", message: `Удалить ${ids.length} писем?`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch("/api/email/inbox", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
    setSelected(null);
    setChecked(new Set());
    await load();
    toast("Удалено");
  }

  function toggleCheck(id: string) { setChecked(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }

  if (loading) return <p className="text-sm text-slate-500 p-4">Загрузка...</p>;

  // Two-pane view when email is selected
  if (selected) {
    return (
      <div className="flex h-full gap-0 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
        {/* Left: list */}
        <div className={`${replyMode ? "hidden lg:flex" : "flex"} w-full lg:w-80 flex-col border-r border-slate-800`}>
          <InboxToolbar onRefresh={refresh} refreshing={refreshing} unread={unread} checked={checked} onDelete={deleteSelected} search={search} onSearch={setSearch} />
          <div className="flex-1 overflow-auto">
            {items.map(e => (
              <InboxRow key={e.id} item={e} active={e.id === selected.id} checked={checked.has(e.id)}
                onSelect={() => openEmail(e)} onCheck={() => toggleCheck(e.id)} />
            ))}
          </div>
        </div>

        {/* Right: email detail or reply/forward form */}
        <div className="flex-1 flex flex-col min-w-0">
          {replyMode ? (
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
              <div className="flex items-center justify-between shrink-0">
                <p className="text-sm font-bold text-white">{replyMode === "reply" ? "Ответить" : "Переслать"}</p>
                <div className="flex gap-2">
                  <button onClick={() => setReplyMode(null)} className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:text-white">Отмена</button>
                </div>
              </div>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Кому</span>
                <input value={replyForm.to} onChange={e => setReplyForm(p => ({ ...p, to: e.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
              <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Тема</span>
                <input value={replyForm.subject} onChange={e => setReplyForm(p => ({ ...p, subject: e.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
              <label className="flex flex-col gap-1 flex-1"><span className="text-xs text-slate-400">Сообщение (HTML)</span>
                <textarea value={replyForm.body} onChange={e => setReplyForm(p => ({ ...p, body: e.target.value }))} rows={10}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white font-mono outline-none focus:border-red-500 resize-none" /></label>
              <button onClick={sendReply} disabled={sending}
                className="shrink-0 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 self-start">
                {sending ? "Отправка..." : "Отправить"}
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5 shrink-0">
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                  ← Назад
                </button>
                <div className="flex-1" />
                <button onClick={startReply} className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:text-white">Ответить</button>
                <button onClick={startForward} className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:text-white">Переслать</button>
                <button onClick={deleteSelected} className="rounded border border-red-800 px-3 py-1 text-xs text-red-400 hover:bg-red-950">Удалить</button>
              </div>
              <div className="p-4 border-b border-slate-800 shrink-0">
                <h2 className="text-lg font-semibold text-white">{selected.subject || "Без темы"}</h2>
                <div className="mt-2 flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="text-slate-300">{selected.from}</p>
                    <p className="text-xs text-slate-500">Кому: {selected.to}</p>
                  </div>
                  <p className="text-xs text-slate-600 shrink-0">{new Date(selected.receivedAt).toLocaleString("ru-RU")}</p>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <div className="text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: selected.body }} />
              </div>
            </div>
          )}
        </div>
        {dialog}
      </div>
    );
  }

  // List-only view
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <InboxToolbar onRefresh={refresh} refreshing={refreshing} unread={unread} checked={checked} onDelete={deleteSelected} search={search} onSearch={setSearch} />
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-600">Нет писем. Нажмите «Обновить» для получения.</p>
        ) : (
          items.map(e => (
            <InboxRow key={e.id} item={e} checked={checked.has(e.id)}
              onSelect={() => openEmail(e)} onCheck={() => toggleCheck(e.id)} />
          ))
        )}
      </div>
      {dialog}
    </div>
  );
}

function InboxToolbar({ onRefresh, refreshing, unread, checked, onDelete, search, onSearch }: {
  onRefresh: () => void; refreshing: boolean; unread: number; checked: Set<string>; onDelete: () => void;
  search: string; onSearch: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2 shrink-0">
      <input type="text" value={search} onChange={e => onSearch(e.target.value)}
        placeholder="Поиск по письмам..."
        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none focus:border-red-500 min-w-0" />
      {search && (
        <button onClick={() => onSearch("")}
          className="text-xs text-slate-500 hover:text-white shrink-0">×</button>
      )}
      <button onClick={onRefresh} disabled={refreshing}
        className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-50 shrink-0">
        {refreshing ? "..." : "Обновить"}
      </button>
      {checked.size > 0 && (
        <button onClick={onDelete}
          className="rounded border border-red-800 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950 shrink-0">
          Удалить ({checked.size})
        </button>
      )}
      {unread > 0 && <span className="text-xs text-slate-500 shrink-0">Новых: {unread}</span>}
    </div>
  );
}

function InboxRow({ item, active, checked, onSelect, onCheck }: {
  item: InboxItem; active?: boolean; checked?: boolean; onSelect: () => void; onCheck: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex cursor-pointer items-start gap-3 border-b border-slate-800/50 px-3 py-3 transition hover:bg-slate-900/50 ${active ? "bg-slate-900 border-l-2 border-l-red-500" : ""} ${!item.isRead ? "bg-slate-900/20" : ""}`}
    >
      <input type="checkbox" checked={checked} onChange={e => { e.stopPropagation(); onCheck(); }}
        className="mt-0.5 h-3.5 w-3.5 accent-red-600 rounded shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {!item.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
          <p className={`text-sm truncate ${item.isRead ? "text-slate-400" : "font-semibold text-white"}`}>
            {item.from.replace(/<.*>/, "").trim()}
          </p>
        </div>
        <p className={`text-xs truncate mt-0.5 ${item.isRead ? "text-slate-500" : "text-slate-300"}`}>
          {item.subject || "Без темы"}
        </p>
      </div>
      <p className="shrink-0 text-[10px] text-slate-600 mt-0.5">
        {formatEmailDate(item.receivedAt)}
      </p>
    </div>
  );
}

function formatEmailDate(d: string): string {
  const date = new Date(d);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

/* ───── Sent ───── */
function SentTab() {
  const [items, setItems] = useState<SentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  useEffect(() => {
    fetch("/api/email/sent?limit=100")
      .then(r => r.json())
      .then(j => { if (j.ok) setItems(j.data.items); setLoading(false); });
  }, []);

  if (loading) return <p className="text-sm text-slate-500 p-4">Загрузка...</p>;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 h-full flex flex-col">
      <div className="flex-1 overflow-auto">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-600">Нет отправленных писем.</p>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {items.map(e => (
              <div key={e.id}>
                <button onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-slate-900/50 transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm truncate text-slate-300">{e.subject || "Без темы"}</span>
                      {e.status === "failed" && <span className="shrink-0 rounded bg-red-900/50 px-1.5 py-0.5 text-[10px] text-red-400">Ошибка</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Кому: {e.to} · {new Date(e.sentAt).toLocaleString("ru-RU")}</p>
                  </div>
                  <svg className={`h-4 w-4 text-slate-500 shrink-0 transition ${expanded === e.id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {expanded === e.id && (
                  <div className="border-t border-slate-800 px-4 py-3 bg-slate-900/20">
                    {e.error && <p className="text-xs text-red-400 mb-2">Ошибка: {e.error}</p>}
                    <div className="rounded-lg border border-slate-700 bg-slate-950 p-3 overflow-auto max-h-64">
                      <div className="text-xs text-slate-300" dangerouslySetInnerHTML={{ __html: e.body }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {dialog}
    </div>
  );
}

/* ───── Settings ───── */
function SettingsTab({ toast }: { toast: (msg: string, type?: "error") => void }) {
  const [form, setForm] = useState<SmtpForm>(EMPTY_SMTP);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [hasPasswords, setHasPasswords] = useState(false);

  useEffect(() => {
    fetch("/api/email/smtp")
      .then(r => r.json())
      .then(j => {
        if (j.ok && j.data) {
          setForm({
            smtp_host: j.data.smtp_host ?? "",
            smtp_port: j.data.smtp_port ?? "587",
            smtp_user: j.data.smtp_user ?? "",
            smtp_pass: j.data.smtp_pass === "••••••••" ? "" : (j.data.smtp_pass ?? ""),
            smtp_from_name: j.data.smtp_from_name ?? "АВТОWAY",
            smtp_from_email: j.data.smtp_from_email ?? "",
            imap_host: j.data.imap_host ?? "",
            imap_port: j.data.imap_port ?? "993",
            imap_user: j.data.imap_user ?? "",
            imap_pass: j.data.imap_pass === "••••••••" ? "" : (j.data.imap_pass ?? ""),
          });
          setHasPasswords((j.data.smtp_pass === "••••••••") || (j.data.imap_pass === "••••••••"));
        }
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/email/smtp", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.ok) toast("Настройки сохранены");
    else toast(json.error ?? "Ошибка", "error");
    setSaving(false);
  }

  function setField(f: string, v: string) { setForm(p => ({ ...p, [f]: v })); }

  if (loading) return <p className="text-sm text-slate-500 p-4">Загрузка...</p>;

  return (
    <div className="overflow-auto h-full max-w-xl">
      <div className="space-y-4">
        {/* SMTP */}
        <div className="rounded-xl border border-slate-800 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">SMTP — отправка писем</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Хост" value={form.smtp_host} onChange={v => setField("smtp_host", v)} placeholder="smtp.gmail.com" />
              <Field label="Порт" value={form.smtp_port} onChange={v => setField("smtp_port", v)} placeholder="587" />
            </div>
            <Field label="Логин" value={form.smtp_user} onChange={v => setField("smtp_user", v)} placeholder="user@gmail.com" />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Пароль (app-password){hasPasswords ? " — сохранён" : ""}</span>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.smtp_pass} onChange={e => setField("smtp_pass", e.target.value)}
                  placeholder={hasPasswords ? "Оставьте пустым, чтобы не менять" : "••••••••"}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-12 text-sm text-white outline-none focus:border-red-500" />
                {hasPasswords && (
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white">
                    {showPass ? "Скрыть" : "Показать"}
                  </button>
                )}
              </div>
              {hasPasswords && <span className="text-[10px] text-slate-600">Пароль хранится в БД в зашифрованном виде.</span>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Имя отправителя" value={form.smtp_from_name} onChange={v => setField("smtp_from_name", v)} placeholder="АВТОWAY" />
              <Field label="Email отправителя" value={form.smtp_from_email} onChange={v => setField("smtp_from_email", v)} placeholder="info@avtoway.by" />
            </div>
          </div>
        </div>

        {/* IMAP */}
        <div className="rounded-xl border border-slate-800 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">IMAP — получение писем</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Хост" value={form.imap_host} onChange={v => setField("imap_host", v)} placeholder="imap.gmail.com" />
              <Field label="Порт" value={form.imap_port} onChange={v => setField("imap_port", v)} placeholder="993" />
            </div>
            <Field label="Логин" value={form.imap_user} onChange={v => setField("imap_user", v)} placeholder="user@gmail.com" />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Пароль (app-password){hasPasswords ? " — сохранён" : ""}</span>
              <div className="relative">
                <input type="password" value={form.imap_pass} onChange={e => setField("imap_pass", e.target.value)}
                  placeholder={hasPasswords ? "Оставьте пустым, чтобы не менять" : "••••••••"}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
              </div>
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
          {saving ? "Сохранение..." : "Сохранить настройки"}
        </button>

        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
          <h3 className="text-xs font-medium text-slate-400 mb-2">Как настроить</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p>• <b>Gmail:</b> SMTP smtp.gmail.com:587, IMAP imap.gmail.com:993. Создать <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-red-400 hover:underline">app-password</a>.</p>
            <p>• <b>Mail.ru:</b> SMTP smtp.mail.ru:587, IMAP imap.mail.ru:993. Пароль внешних приложений.</p>
            <p>• <b>Yandex:</b> SMTP smtp.yandex.ru:587, IMAP imap.yandex.ru:993. Пароль приложения.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
    </label>
  );
}
