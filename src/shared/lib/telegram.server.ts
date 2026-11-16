import "server-only";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { decryptSecret, encryptSecret } from "@/shared/lib/encryption";
import { sendEmail } from "@/shared/lib/mail";
import { SITE_URL } from "@/shared/config/site";
import { logger } from "@/shared/lib/logger";

const KEYS = {
  token: "telegram_bot_token",
  chatId: "telegram_chat_id",
  enabled: "telegram_enabled",
} as const;

export interface TelegramSettings {
  enabled: boolean;
  chatId: string;
  hasToken: boolean;
}

export interface TelegramSettingsInput {
  enabled?: boolean;
  chatId?: string;
  /** Пустая строка или undefined — оставить текущий токен. */
  token?: string;
}

async function readSettings(): Promise<Record<string, string>> {
  const rows = await getPrismaClient().setting.findMany({
    where: { key: { in: Object.values(KEYS) } },
  });
  return Object.fromEntries(rows.map(row => [row.key, row.value]));
}

export async function getTelegramSettings(): Promise<TelegramSettings> {
  const map = await readSettings();
  return {
    enabled: map[KEYS.enabled] === "true",
    chatId: map[KEYS.chatId] ?? "",
    hasToken: Boolean(map[KEYS.token]),
  };
}

export async function saveTelegramSettings(input: TelegramSettingsInput): Promise<TelegramSettings> {
  const db = getPrismaClient();
  const values: Array<[string, string]> = [];
  if (input.enabled !== undefined) values.push([KEYS.enabled, String(input.enabled)]);
  if (input.chatId !== undefined) values.push([KEYS.chatId, input.chatId.trim()]);
  if (input.token !== undefined && input.token.trim() !== "") {
    values.push([KEYS.token, encryptSecret(input.token.trim())]);
  }

  if (values.length > 0) {
    await db.$transaction(
      values.map(([key, value]) =>
        db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
      ),
    );
  }
  return getTelegramSettings();
}

async function resolveConfig(): Promise<{ token: string; chatId: string } | null> {
  const map = await readSettings();
  if (map[KEYS.enabled] !== "true") return null;
  const chatId = map[KEYS.chatId];
  const encrypted = map[KEYS.token];
  if (!chatId || !encrypted) return null;
  try {
    return { token: decryptSecret(encrypted), chatId };
  } catch (error) {
    logger.warn("telegram: не удалось расшифровать токен", { error: String(error) });
    return null;
  }
}

async function recordFailure(message: string): Promise<void> {
  try {
    await getPrismaClient().systemEvent.create({
      data: { level: "warning", source: "telegram", message: message.slice(0, 2000) },
    });
  } catch {
    // Журнал недоступен — не ломаем основной сценарий.
  }
}

/** Отправляет сообщение в Telegram. Возвращает true при успехе. */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  const config = await resolveConfig();
  if (!config) return false;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${config.token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      await recordFailure(`Telegram API ${response.status}: ${detail.slice(0, 500)}`);
      return false;
    }
    return true;
  } catch (error) {
    await recordFailure(`Telegram отправка не удалась: ${(error as Error).message}`);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export interface LeadNotification {
  source: string;
  service?: string;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  pageUrl?: string;
  utm?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Дублирует заявку на email из контактов, если SMTP настроен. */
async function notifyLeadByEmail(lead: LeadNotification): Promise<void> {
  try {
    const db = getPrismaClient();
    const [smtp, contact] = await Promise.all([
      db.setting.findUnique({ where: { key: "smtp_host" } }),
      db.contact.findFirst(),
    ]);
    if (!smtp?.value || !contact?.email) return;

    const lines = [
      `<p><b>Новая заявка</b></p>`,
      `<p><b>Источник:</b> ${escapeHtml(lead.source)}</p>`,
      lead.service ? `<p><b>Услуга:</b> ${escapeHtml(lead.service)}</p>` : "",
      `<p><b>Имя:</b> ${escapeHtml(lead.name)}</p>`,
      lead.phone ? `<p><b>Телефон:</b> ${escapeHtml(lead.phone)}</p>` : "",
      lead.email ? `<p><b>Email:</b> ${escapeHtml(lead.email)}</p>` : "",
      lead.message ? `<p><b>Сообщение:</b> ${escapeHtml(lead.message.slice(0, 1000))}</p>` : "",
      lead.utm ? `<p><b>UTM:</b> ${escapeHtml(lead.utm)}</p>` : "",
      lead.pageUrl ? `<p><b>Страница:</b> ${escapeHtml(lead.pageUrl.slice(0, 300))}</p>` : "",
      `<p><a href="${SITE_URL}/admin/requests">Открыть заявки в админке</a></p>`,
    ].filter(Boolean);

    await sendEmail(
      contact.email,
      `Новая заявка: ${lead.source} — ${lead.name}`,
      lines.join("\n"),
    );
  } catch (error) {
    logger.warn("email: notifyNewLead failed", { error: String(error) });
  }
}

/** Уведомление о новой заявке. Не блокирует ответ клиенту. */
export function notifyNewLead(lead: LeadNotification): void {
  const lines = [
    "🔔 <b>Новая заявка</b>",
    `<b>Источник:</b> ${escapeHtml(lead.source)}`,
  ];
  if (lead.service) lines.push(`<b>Услуга:</b> ${escapeHtml(lead.service)}`);
  lines.push(`<b>Имя:</b> ${escapeHtml(lead.name)}`);
  if (lead.phone) lines.push(`<b>Телефон:</b> ${escapeHtml(lead.phone)}`);
  if (lead.email) lines.push(`<b>Email:</b> ${escapeHtml(lead.email)}`);
  if (lead.message) lines.push(`<b>Сообщение:</b> ${escapeHtml(lead.message.slice(0, 500))}`);
  if (lead.utm) lines.push(`<b>UTM:</b> ${escapeHtml(lead.utm)}`);
  if (lead.pageUrl) lines.push(`<b>Страница:</b> ${escapeHtml(lead.pageUrl.slice(0, 300))}`);
  lines.push(`\n<a href="${SITE_URL}/admin/requests">Открыть заявки в админке</a>`);

  void sendTelegramMessage(lines.join("\n")).catch(error => {
    logger.warn("telegram: notifyNewLead failed", { error: String(error) });
  });
  void notifyLeadByEmail(lead);
}
