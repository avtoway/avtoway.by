import "@/di/composition-root";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import {
  getTelegramSettings,
  saveTelegramSettings,
  sendTelegramMessage,
} from "@/shared/lib/telegram.server";

const settingsSchema = z.object({
  enabled: z.boolean().optional(),
  chatId: z
    .string()
    .trim()
    .max(100)
    .regex(/^[-@\w]*$/, "Chat ID: цифры, @имя канала или -100…")
    .optional(),
  token: z.string().trim().max(300).optional(),
});

export async function GET() {
  try {
    await requireAuth("audit.view");
    return NextResponse.json({ ok: true, data: await getTelegramSettings() });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth("audit.view");
    const parsed = validateOrResponse(settingsSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const data = await saveTelegramSettings(parsed.data);
    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "TelegramSettings",
      entityId: "main",
      details: { enabled: data.enabled, chatId: data.chatId, hasToken: data.hasToken },
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST() {
  try {
    await requireAuth("audit.view");
    const sent = await sendTelegramMessage(
      "✅ Тестовое сообщение АВТОWAY. Уведомления о заявках настроены.",
    );
    if (!sent) {
      throw new ValidationError("Не удалось отправить сообщение. Проверьте токен бота, Chat ID и что бот добавлен в чат.");
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toApiError(error);
  }
}
