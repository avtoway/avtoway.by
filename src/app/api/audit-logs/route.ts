import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import type { AuditLogRepository } from "@/entities/audit/audit.repository";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!hasPermission(user, "audit.view")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const repo = container.get<AuditLogRepository>("AuditLogRepository");
  const logs = await repo.getAll({
    action: searchParams.get("action") ?? undefined,
    entity: searchParams.get("entity") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    limit: 100,
  });

  return NextResponse.json({ ok: true, data: logs });
}
