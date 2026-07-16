"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UploadZone from "@/shared/ui/admin/upload-zone";
import ProfileView from "@/features/admin/users/ui/profile-view";
import ProfileForm from "@/features/admin/users/ui/profile-form";
import PasswordSection from "@/features/admin/users/ui/password-section";
import type { ProfileData } from "@/features/admin/users/types";
import { useDirtyForm } from "@/shared/lib/dirty-form-context";

const ROLE_COLORS: Record<string, string> = {
  "Администратор": "bg-red-900/50 text-red-300",
  "Редактор": "bg-blue-900/50 text-blue-300",
  "Наблюдатель": "bg-slate-800 text-slate-400",
};

export default function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = use(params);
  const { view } = use(searchParams);
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [perms, setPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [initialForm, setInitialForm] = useState<Record<string, any>>({});
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const { setDirty } = useDirtyForm();

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then(r => r.json());
        if (!me.ok) { router.push("/admin/login"); return; }
        setCurrentUserId(me.data.id);
        setPerms(me.data.permissions ?? []);
        const res = await fetch(`/api/users/${id}`).then(r => r.json());
        if (!res.ok) { router.push("/admin"); return; }
        setProfile(res.data);
        const f: Record<string, any> = {};
        for (const key of ["name", "email", "phone", "telegram", "birth_date",
          "position", "hire_date", "work_schedule", "bio", "photo"]) {
          f[key] = (res.data as any)[key] ?? "";
        }
        setForm(f);
      } catch { router.push("/admin/login"); } finally { setLoading(false); }
    })();
  }, [router, id]);

  useEffect(() => { if (view === "1") requestAnimationFrame(() => setEditing(false)); }, [view]);

  useEffect(() => {
    if (!editing) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editing]);

  const isOwn = currentUserId === id;
  const canEdit = isOwn || perms.includes("users.manage");
  const isDirty = editing && JSON.stringify(form) !== JSON.stringify(initialForm);

  useEffect(() => { setDirty(isDirty); }, [isDirty, setDirty]);

  function set(field: string, value: any) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true); setSaved(false); setPwError("");
    const body: Record<string, any> = { ...form };
    if (newPassword) {
      if (newPassword.length < 6) { setPwError("Минимум 6 символов"); setSaving(false); return; }
      if (newPassword !== confirmPassword) { setPwError("Новые пароли не совпадают"); setSaving(false); return; }
      if (!oldPassword) { setPwError("Введите текущий пароль"); setSaving(false); return; }
      body.oldPassword = oldPassword;
      body.newPassword = newPassword;
    }
    const res = await fetch(`/api/users/${profile.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const json = await res.json();
    if (json.ok) {
      setSaved(true); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setPwError("");
      setProfile(json.data);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setPwError(json.error ?? "Ошибка сохранения");
    }
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center pt-20"><p className="text-slate-500">Загрузка...</p></div>;
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-2xl font-bold text-slate-400">
          {profile.photo
            ? <img src={profile.photo} alt="" className="h-full w-full rounded-full object-cover" />
            : (profile.name?.charAt(0) ?? "?").toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          <p className="mt-0.5 text-xs text-slate-500">@{profile.login}</p>
          <p className="mt-1 text-sm text-slate-500">
            {profile.position ?? "Должность не указана"}
            {!isOwn && <span className="ml-2 text-slate-600">(id: {id.slice(0, 8)}…)</span>}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.roles.map(r => (
              <span key={r.id} className={`rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[r.name] ?? "bg-slate-800 text-slate-400"}`}>{r.name}</span>
            ))}
          </div>
        </div>
        {canEdit && !editing && (
          <button onClick={() => { setEditing(true); setInitialForm({ ...form }); }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Редактировать
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-6">
          <fieldset className="rounded-xl border border-slate-800 p-6">
            <legend className="px-1 text-lg font-semibold text-white">Фото</legend>
            <div className="mt-2">
              <UploadZone label="Загрузить фото" currentPreview={form.photo} onUpload={url => set("photo", url)} />
            </div>
          </fieldset>

          <div className="rounded-xl border border-slate-800 p-6">
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs font-medium text-slate-400">Логин</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">@</span>
                <input value={profile.login} disabled
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 pl-7 text-sm text-slate-400 outline-none cursor-not-allowed" />
              </div>
            </label>
          </div>

          <ProfileForm
            form={form}
            onChange={set}
            allowedSections={perms.includes("users.manage") ? ["Личное", "Работа"] : ["Личное"]}
          />

          {isOwn && (
            <PasswordSection
              oldPassword={oldPassword} setOldPassword={setOldPassword}
              newPassword={newPassword} setNewPassword={setNewPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              showPw={showPw} setShowPw={setShowPw}
              pwError={pwError}
            />
          )}

          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving}
              className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {saving ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button type="button" onClick={() => { setEditing(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); setPwError(""); setDirty(false); }}
              className="rounded-lg px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">Отмена</button>
            {saved && <span className="text-sm text-green-400">✓ Сохранено</span>}
          </div>
        </form>
      ) : (
        <ProfileView profile={profile} />
      )}
    </div>
  );
}
