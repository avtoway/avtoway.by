/**
 * Приводит значение Telegram из админки к ссылке.
 * Поддерживает и полный URL (`https://t.me/avtoway_by`), и `@handle`.
 */
export function telegramUrl(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://t.me/${raw.replace(/^@/, "")}`;
}

/** `@handle` для отображения (или исходное значение, если это не t.me-ссылка). */
export function telegramHandle(value?: string | null): string {
  const url = telegramUrl(value);
  if (!url) return "";
  const match = url.match(/t\.me\/([^/?#]+)/i);
  return match ? `@${match[1]}` : url;
}
