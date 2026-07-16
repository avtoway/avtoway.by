"use client";

import { useState, useCallback } from "react";

export function useColorReveal() {
  const [hoverColor, setHoverColor] = useState<string | null>(null);

  const handleHover = useCallback((color: string) => setHoverColor(color), []);
  const handleLeave = useCallback(() => setHoverColor(null), []);

  return { hoverColor, handleHover, handleLeave };
}
