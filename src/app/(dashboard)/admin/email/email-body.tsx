"use client";

import { useMemo } from "react";
import { sanitizeEmailHtml } from "@/shared/lib/sanitize-html";

/**
 * Безопасный рендер HTML письма.
 *
 * Тело входящего письма — недоверенные данные: скрипты, формы, обработчики
 * и внешние `<style>` вырезаются. Компонент грузится только на клиенте
 * (`ssr: false`), т.к. DOMPurify требует DOM.
 */
export default function EmailBody({ html, className }: { html: string; className?: string }) {
  const safeHtml = useMemo(() => sanitizeEmailHtml(html), [html]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: safeHtml }} />;
}
