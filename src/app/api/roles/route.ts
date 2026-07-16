import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { RoleSchema } from "@/entities/role/role.schema";
import type { RoleRepository } from "@/entities/role/role.repository";

export async function GET() {
  const user = await getAuthUser();
  if (!hasPermission(user, "users.roles")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const repo = container.get<RoleRepository>("RoleRepository");
  const roles = await repo.getAll();
  return NextResponse.json({ ok: true, data: roles });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!hasPermission(user, "users.roles")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = validateOrResponse(RoleSchema, body);
  if (!("validated" in parsed)) return parsed;

  const repo = container.get<RoleRepository>("RoleRepository");
  const existing = (await repo.getAll()).find(r => r.name === parsed.data.name);
  if (existing) {
    return NextResponse.json({ ok: false, error: "Роль уже существует" }, { status: 409 });
  }

  const role = await repo.create({
    name: parsed.data.name,
    description: parsed.data.description || undefined,
    level: parsed.data.level,
    permissions: parsed.data.permissions ?? [],
  });

  await createAuditLog({
    userId: user!.id, action: "CREATE", entity: "Role", entityId: role.id,
    details: { name: role.name, permissions: role.permissions },
  });

  return NextResponse.json({ ok: true, data: role }, { status: 201 });
}
