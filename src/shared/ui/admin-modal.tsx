"use client";

import { useEffect, useRef } from "react";

const SIZE_MAP = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
} as const;

export default function AdminModal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: keyof typeof SIZE_MAP;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={`backdrop:bg-black/70 ${SIZE_MAP[size]} mx-auto my-auto w-full rounded-xl border border-slate-800 bg-slate-950 p-0 text-white shadow-2xl`}
      style={{ margin: "auto" }}
    >
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-6 py-4">{children}</div>
    </dialog>
  );
}
