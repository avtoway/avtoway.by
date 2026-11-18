import { NextResponse } from "next/server";
import { requireAnyAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

const MARKETING_PERMS = ["services.manage", "audit.view"];
const SETTING_KEY = "ads_txt";

export async function GET() {
  try {
    await requireAnyAuth(MARKETING_PERMS);
    const row = await getPrismaClient().setting.findUnique({ where: { key: SETTING_KEY } });
    return NextResponse.json({ ok: true, data: { content: row?.value ?? "" } });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAnyAuth(MARKETING_PERMS);
    const body = (await request.json().catch(() => ({}))) as { content?: unknown };
    if (typeof body.content !== "string") throw new ValidationError("Некорректное содержимое ads.txt");
    if (body.content.length > 5000) throw new ValidationError("Слишком длинный файл (максимум 5000 символов)");

    const content = body.content.trim();
    const db = getPrismaClient();
    await db.setting.upsert({
      where: { key: SETTING_KEY },
      update: { value: content },
      create: { key: SETTING_KEY, value: content },
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "Setting",
      entityId: SETTING_KEY,
      details: { length: content.length },
    });

    return NextResponse.json({ ok: true, data: { content } });
  } catch (error) {
    return toApiError(error);
  }
}
