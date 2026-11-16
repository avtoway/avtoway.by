"use client";

export default function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white print:hidden"
    >
      Скачать / распечатать PDF
    </button>
  );
}
