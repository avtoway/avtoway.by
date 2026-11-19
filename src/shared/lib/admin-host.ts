import { SITE_URL } from "@/shared/config/site";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "0.0.0.0"]);

/**
 * Разрешён ли вход в админку для этого хоста.
 *
 * Открыто только на локальных адресах и на явно разрешённых хостах:
 * прод-домен из `NEXT_PUBLIC_SITE_URL` + список `ADMIN_ALLOWED_HOSTS`.
 * Публичные туннели (bore.pub, trycloudflare.com, ngrok, localhost.run и др.)
 * в этот список не входят, поэтому админка по временной ссылке закрыта.
 */
export function isAdminHostAllowed(
  host: string,
  options: { siteUrl?: string; allowedHosts?: string } = {},
): boolean {
  const raw = host.trim().toLowerCase();
  // IPv6 в заголовке Host приходит в скобках: [::1]:3001.
  const hostname = raw.startsWith("[")
    ? raw.slice(1, raw.indexOf("]") > 0 ? raw.indexOf("]") : undefined)
    : (raw.split(":")[0] ?? "").trim();
  if (!hostname) return false;
  if (LOCAL_HOSTS.has(hostname)) return true;

  const allowed = (options.allowedHosts ?? process.env.ADMIN_ALLOWED_HOSTS ?? "")
    .split(",")
    .map(value => value.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.includes(hostname)) return true;

  try {
    const siteHost = new URL(options.siteUrl ?? SITE_URL).hostname.toLowerCase();
    if (siteHost === hostname) return true;
  } catch {
    // Некорректный адрес сайта не должен открывать админку.
  }

  return false;
}
