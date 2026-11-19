"use client";

import { useState, useEffect, useCallback } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
    // Не листаем сами, если пользователь просил уменьшить анимации.
    if (prefersReducedMotion()) return;

    let timer = window.setInterval(goNext, autoScrollInterval);

    // В фоновой вкладке автопрокрутка не нужна: экономим батарею и трафик.
    const onVisibilityChange = () => {
      window.clearInterval(timer);
      if (!document.hidden) timer = window.setInterval(goNext, autoScrollInterval);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [autoScrollInterval, totalItems, isHovered, goNext]);

  return { current, totalItems, isHovered, setIsHovered, goNext, goPrev, setCurrent };
}
