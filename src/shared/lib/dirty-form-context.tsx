"use client";

import { createContext, useContext, useState } from "react";

interface DirtyFormContextValue {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  confirmLeave: string | null;
  setConfirmLeave: (href: string | null) => void;
  pendingHref: string | null;
  setPendingHref: (href: string | null) => void;
}

const DirtyFormCtx = createContext<DirtyFormContextValue>({
  isDirty: false,
  setDirty: () => {},
  confirmLeave: null,
  setConfirmLeave: () => {},
  pendingHref: null,
  setPendingHref: () => {},
});

export function DirtyFormProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  return (
    <DirtyFormCtx.Provider value={{ isDirty, setDirty, confirmLeave, setConfirmLeave, pendingHref, setPendingHref }}>
      {children}
    </DirtyFormCtx.Provider>
  );
}

export function useDirtyForm() {
  return useContext(DirtyFormCtx);
}
