"use client";

import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export default function MultiSelect({
  options,
  values,
  onChange,
  placeholder = "Выберите...",
  searchPlaceholder = "Поиск...",
}: {
  options: SelectOption[];
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (value: string) => {
    onChange(
      values.includes(value)
        ? values.filter(v => v !== value)
        : [...values, value],
    );
  };

  const selectedLabels = options
    .filter(o => values.includes(o.value))
    .map(o => o.label);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-[38px] w-full flex-wrap items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-left outline-none transition hover:border-slate-600 focus:border-red-500"
      >
        {selectedLabels.length === 0 ? (
          <span className="text-slate-500">{placeholder}</span>
        ) : (
          selectedLabels.map(label => (
            <span
              key={label}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300"
            >
              {label}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  const opt = options.find(o => o.label === label);
                  if (opt) toggle(opt.value);
                }}
                className="ml-0.5 text-slate-500 hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))
        )}
        <svg
          className={`ml-auto h-4 w-4 shrink-0 text-slate-500 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl">
          {/* Search */}
          <div className="border-b border-slate-700 p-2">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-red-500"
            />
          </div>

          {/* Options */}
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">Ничего не найдено</p>
            ) : (
              filtered.map(o => {
                const checked = values.includes(o.value);
                return (
                  <label
                    key={o.value}
                    className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition ${
                      checked ? "bg-red-600/5 text-slate-200" : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(o.value)}
                      className="h-4 w-4 accent-red-600"
                    />
                    {o.label}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
