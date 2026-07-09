"use client";

import { useState, useEffect, useCallback } from "react";

export function useCarousel(totalItems: number, autoScrollInterval?: number) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % totalItems);
  }, [totalItems]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + totalItems) % totalItems);
  }, [totalItems]);

  useEffect(() => {
    if (!autoScrollInterval || totalItems <= 1 || isHovered) return;
    const timer = setInterval(goNext, autoScrollInterval);
    return () => clearInterval(timer);
  }, [autoScrollInterval, totalItems, isHovered, goNext]);

  return { current, totalItems, isHovered, setIsHovered, goNext, goPrev, setCurrent };
}
