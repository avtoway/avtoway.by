import "@/di/composition-root";
import { NextResponse } from "next/server";
import { toApiError } from "@/shared/lib/errors";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { encryptSecret } from "@/shared/lib/encryption";

const SETTINGS_KEYS = [
  "smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from_name", "smtp_from_email",
  "imap_host", "imap_port", "imap_user", "imap_pass",
];

const SECRET_KEYS = new Set(["smtp_pass", "imap_pass"]);

export async function GET() {
  try {
    const db = getPrismaClient();
    const rows = await db.setting.findMany({ where: { key: { in: SETTINGS_KEYS } } });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    // Never return secret values to the client
    for (const key of SECRET_KEYS) {
      if (map[key]) map[key] = "••••••••";
    }
    return NextResponse.json({ ok: true, data: map });
  } catch (e) { return toApiError(e); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const db = getPrismaClient();

    for (const key of SETTINGS_KEYS) {
      if (body[key] === undefined) continue;

      // Skip masked password placeholders — keep existing value
      if (SECRET_KEYS.has(key) && (body[key] === "••••••••" || body[key] === "")) continue;

      const value = SECRET_KEYS.has(key) ? encryptSecret(body[key]) : (body[key] ?? "");

      const existing = await db.setting.findUnique({ where: { key } });
      if (existing) {
        await db.setting.update({ where: { key }, data: { value } });
      } else {
        await db.setting.create({ data: { key, value } });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) { return toApiError(e); }
}
