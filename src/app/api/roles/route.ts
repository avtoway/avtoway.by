import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
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

  try {
    const body = (await request.json()) as { name?: string; description?: string; level?: number; permissions?: string[] };
    if (!body.name) {
      return NextResponse.json({ ok: false, error: "Название обязательно" }, { status: 400 });
    }

    const repo = container.get<RoleRepository>("RoleRepository");
    const existing = (await repo.getAll()).find(r => r.name === body.name);
    if (existing) {
      return NextResponse.json({ ok: false, error: "Роль уже существует" }, { status: 409 });
    }

    const role = await repo.create({
      name: body.name,
      description: body.description,
      level: body.level ?? 0,
      permissions: body.permissions ?? [],
    });

    await createAuditLog({
      userId: user!.id, action: "CREATE", entity: "Role", entityId: role.id,
      details: { name: role.name, permissions: role.permissions },
    });

    return NextResponse.json({ ok: true, data: role }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный запрос" }, { status: 400 });
  }
}
