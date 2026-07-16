"use client";

import type { ProfileData } from "../types";

const LABELS: Record<string, string> = {
  name: "ФИО", email: "Email", phone: "Телефон", telegram: "Telegram", birth_date: "Дата рождения",
  position: "Должность", hire_date: "Дата приёма", work_schedule: "График работы", bio: "О себе",
};

const SCHEDULE_LABELS: Record<string, string> = {
  full_time: "Полный день", part_time: "Неполный день",
  shift: "Сменный график", freelance: "Фриланс/Подработка",
};

const SECTIONS: Record<string, (keyof ProfileData)[]> = {
  "Личное": ["name", "email", "phone", "telegram", "birth_date"],
  "Работа": ["position", "hire_date", "work_schedule", "bio"],
};

function ViewValue({ field, profile }: { field: keyof ProfileData; profile: ProfileData }) {
  const val = profile[field];
  if (field === "work_schedule" && val && typeof val === "string") {
    return <span>{SCHEDULE_LABELS[val] ?? val}</span>;
  }
  if (!val) return <span className="text-slate-600">—</span>;
  if (field === "birth_date" || field === "hire_date") {
    return <span>{new Date(val as string).toLocaleDateString("ru-RU")}</span>;
  }
  return <span>{String(val)}</span>;
}

export default function ProfileView({ profile }: { profile: ProfileData }) {
  return (
    <div className="space-y-6">
      {Object.entries(SECTIONS).map(([section, keys]) => (
        <div key={section} className="rounded-xl border border-slate-800 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">{section}</h2>
          <dl className="grid grid-cols-2 gap-4">
            {keys.map(key => (
              <div key={key} className={key === "bio" ? "col-span-2" : ""}>
                <dt className="text-xs font-medium text-slate-400">{LABELS[key] ?? key}</dt>
                <dd className="mt-0.5 text-sm text-slate-200"><ViewValue field={key} profile={profile} /></dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
