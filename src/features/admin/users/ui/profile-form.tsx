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

const WORK_SCHEDULES = ["full_time", "part_time", "shift", "freelance"] as const;

const SECTIONS: Record<string, (keyof ProfileData)[]> = {
  "Личное": ["name", "email", "phone", "telegram", "birth_date"],
  "Работа": ["position", "hire_date", "work_schedule", "bio"],
};

export default function ProfileForm({
  form,
  onChange,
  allowedSections,
}: {
  form: Record<string, any>;
  onChange: (field: string, value: any) => void;
  allowedSections: string[];
}) {
  return (
    <>
      {Object.entries(SECTIONS)
        .filter(([section]) => allowedSections.includes(section))
        .map(([section, keys]) => (
          <fieldset key={section} className="rounded-xl border border-slate-800 p-6">
            <legend className="px-1 text-lg font-semibold text-white">{section}</legend>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {keys.map(key => {
                const val = form[key] ?? "";
                const isSelect = key === "work_schedule";
                const isMultiline = key === "bio";
                return (
                  <label key={key} className={isMultiline ? "col-span-2 flex flex-col gap-1.5" : "flex flex-col gap-1.5"}>
                    <span className="text-xs font-medium text-slate-400">{LABELS[key] ?? key}</span>
                    {key === "birth_date" || key === "hire_date" ? (
                      <input type="date" value={val} onChange={e => onChange(key, e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
                    ) : isSelect ? (
                      <select value={val} onChange={e => onChange(key, e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
                        {WORK_SCHEDULES.map(s => <option key={s} value={s}>{SCHEDULE_LABELS[s]}</option>)}
                      </select>
                    ) : isMultiline ? (
                      <textarea value={val} onChange={e => onChange(key, e.target.value)} rows={3}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
                    ) : (
                      <input value={val} onChange={e => onChange(key, e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
    </>
  );
}
