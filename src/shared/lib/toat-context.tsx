"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = nextId++;
    setItems(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setItems(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {items.map(t => (
          <div key={t.id}
            className={`animate-slide-up rounded-lg px-5 py-3 text-sm font-medium text-white shadow-lg transition-all ${
              t.type === "success" ? "bg-green-600"
              : t.type === "error" ? "bg-red-600"
              : "bg-blue-600"
            }`}>
            {t.message}
            <button onClick={() => setItems(prev => prev.filter(x => x.id !== t.id))}
              className="ml-3 text-white/70 hover:text-white">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
