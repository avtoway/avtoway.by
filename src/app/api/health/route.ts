import { NextResponse } from "next/server";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, { status: "ok" | "error" | "not_configured"; detail?: string; latencyMs?: number }> = {};

  try {
    const dbStartedAt = Date.now();
    const db = getPrismaClient();
    await db.$queryRaw`SELECT 1`;
    checks.database = { status: "ok", latencyMs: Date.now() - dbStartedAt };

    const smtp = await db.setting.findUnique({ where: { key: "smtp_host" } });
    checks.mail = smtp?.value
      ? { status: "ok", detail: "SMTP настроен" }
      : { status: "not_configured", detail: "SMTP не настроен" };
  } catch (error) {
    checks.database = {
      status: "error",
      detail: error instanceof Error ? error.message : "Неизвестная ошибка",
    };
    checks.mail = { status: "not_configured", detail: "Проверка почты недоступна без БД" };
  }

  const healthy = checks.database?.status === "ok";
  return NextResponse.json({
    ok: healthy,
    status: healthy ? (checks.mail?.status === "ok" ? "healthy" : "degraded") : "unhealthy",
    service: "avtoway",
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startedAt,
    checks,
  }, { status: healthy ? 200 : 503 });
}
