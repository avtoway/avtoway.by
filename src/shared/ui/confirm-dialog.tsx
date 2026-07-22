"use client";

import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
}

export function useConfirm() {
  const [state, setState] = useState<{ options: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ options, resolve });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    state?.resolve(result);
    setState(null);
  }, [state]);

  const dialog = state ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-950 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white">{state.options.title}</h3>
        <p className="mt-2 text-sm text-slate-400">{state.options.message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => handleClose(false)}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
            {state.options.cancelLabel ?? "Отмена"}
          </button>
          <button onClick={() => handleClose(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              state.options.variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}>
            {state.options.confirmLabel ?? "Подтвердить"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}
