"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toat-context";

interface ContactForm {
  phone: string;
  email: string;
  telegram: string;
  viber: string;
  whatsapp: string;
  instagram: string;
  youtube: string;
  rutube: string;
  vk: string;
  address: string;
  workingHours: string;
}

const EMPTY: ContactForm = {
  phone: "", email: "", telegram: "", viber: "", whatsapp: "",
  instagram: "", youtube: "", rutube: "", vk: "", address: "", workingHours: "",
};

export default function AdminContactsPage() {
  const [form, setForm] = useState<ContactForm>(EMPTY);
  const [original, setOriginal] = useState<ContactForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/contacts")
      .then(r => r.json())
      .then(j => {
        if (j.ok && j.data) {
          const d = {
            phone: j.data.phone ?? "",
            email: j.data.email ?? "",
            telegram: j.data.telegram ?? "",
            viber: j.data.viber ?? "",
            whatsapp: j.data.whatsapp ?? "",
            instagram: j.data.instagram ?? "",
            youtube: j.data.youtube ?? "",
            rutube: j.data.rutube ?? "",
            vk: j.data.vk ?? "",
            address: j.data.address ?? "",
            workingHours: j.data.workingHours ?? "",
          };
          setForm(d);
          setOriginal(d);
        }
        setLoading(false);
      });
  }, []);

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function startEdit() {
    setOriginal({ ...form });
    setEditing(true);
  }

  function cancelEdit() {
    if (original) setForm(original);
    setEditing(false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/contacts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.ok) {
      setOriginal({ ...form });
      setEditing(false);
      toast("Сохранено");
    } else toast(json.error ?? "Ошибка", "error");
    setSaving(false);
  }

  const hasData = form.phone || form.email || form.telegram || form.viber || form.whatsapp ||
    form.instagram || form.youtube || form.rutube || form.vk || form.address || form.workingHours;

  if (loading) return <p className="text-sm text-slate-500">Загрузка...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Контакты</h1>
          <p className="mt-0.5 text-sm text-slate-500">Контактная информация сайта</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={cancelEdit}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
                Отмена
              </button>
              <button onClick={save} disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </>
          ) : (
            <button onClick={startEdit}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Редактировать
            </button>
          )}
        </div>
      </div>

      {/* Preview mode */}
      {!editing && !hasData && (
        <div className="rounded-xl border border-slate-800 p-8 text-center">
          <p className="text-sm text-slate-500">Контактная информация не заполнена.</p>
          <p className="mt-1 text-xs text-slate-600">Нажмите «Редактировать», чтобы добавить контакты.</p>
        </div>
      )}

      {!editing && hasData && (
        <div className="grid gap-4 sm:grid-cols-2">
          {form.phone && <PreviewCard label="Телефон" value={form.phone} intent="primary" />}
          {form.email && <PreviewCard label="Email" value={form.email} intent="info" />}
          {form.address && <PreviewCard label="Адрес" value={form.address} intent="success" />}
          {form.workingHours && <PreviewCard label="Часы работы" value={form.workingHours} intent="accent" />}
          {form.telegram && <PreviewCard label="Telegram" value={form.telegram} intent="sky" />}
          {form.viber && <PreviewCard label="Viber" value={form.viber} intent="purple" />}
          {form.whatsapp && <PreviewCard label="WhatsApp" value={form.whatsapp} intent="green" />}
          {form.instagram && <PreviewCard label="Instagram" value={form.instagram} intent="pink" />}
          {form.youtube && <PreviewCard label="YouTube" value={form.youtube} intent="red" />}
          {form.rutube && <PreviewCard label="Rutube" value={form.rutube} intent="violet" />}
          {form.vk && <PreviewCard label="VK" value={form.vk} intent="blue" />}
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <div className="grid gap-6 lg:grid-cols-2">
          <fieldset className="rounded-xl border border-slate-800 p-5">
            <legend className="px-2 text-xs font-medium text-slate-400">Телефоны и мессенджеры</legend>
            <div className="mt-3 flex flex-col gap-4">
              <Field label="Телефон" value={form.phone} onChange={v => setField("phone", v)} placeholder="+375 (29) 111-22-33" />
              <Field label="Telegram" value={form.telegram} onChange={v => setField("telegram", v)} placeholder="https://t.me/avtoway" />
              <Field label="Viber (номер)" value={form.viber} onChange={v => setField("viber", v)} placeholder="+375291112233" />
              <Field label="WhatsApp (номер)" value={form.whatsapp} onChange={v => setField("whatsapp", v)} placeholder="+375291112233" />
              <Field label="Email" value={form.email} onChange={v => setField("email", v)} placeholder="info@avtoway.by" />
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-slate-800 p-5">
            <legend className="px-2 text-xs font-medium text-slate-400">Социальные сети</legend>
            <div className="mt-3 flex flex-col gap-4">
              <Field label="Instagram" value={form.instagram} onChange={v => setField("instagram", v)} placeholder="https://instagram.com/avtoway_by" />
              <Field label="YouTube" value={form.youtube} onChange={v => setField("youtube", v)} placeholder="https://youtube.com/@avtoway" />
              <Field label="Rutube" value={form.rutube} onChange={v => setField("rutube", v)} placeholder="https://rutube.ru/channel/..." />
              <Field label="VK Видео" value={form.vk} onChange={v => setField("vk", v)} placeholder="https://vk.com/video/@..." />
              <Field label="Адрес" value={form.address} onChange={v => setField("address", v)} placeholder="г. Минск, Беларусь" />
              <Field label="Часы работы" value={form.workingHours} onChange={v => setField("workingHours", v)} placeholder="Пн–Вс 9:00 – 21:00" />
            </div>
          </fieldset>
        </div>
      )}
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

function PreviewCard({ label, value, intent }: { label: string; value: string; intent: string }) {
  const colors: Record<string, string> = {
    primary: "border-red-500/20 bg-red-500/5",
    info: "border-blue-500/20 bg-blue-500/5",
    success: "border-green-500/20 bg-green-500/5",
    accent: "border-violet-500/20 bg-violet-500/5",
    sky: "border-sky-500/20 bg-sky-500/5",
    purple: "border-purple-500/20 bg-purple-500/5",
    green: "border-emerald-500/20 bg-emerald-500/5",
    pink: "border-pink-500/20 bg-pink-500/5",
    red: "border-red-500/20 bg-red-500/5",
    violet: "border-violet-500/20 bg-violet-500/5",
    blue: "border-blue-500/20 bg-blue-500/5",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[intent] ?? "border-slate-700 bg-slate-900/30"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-white break-all">{value}</p>
    </div>
  );
}
