import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import type { RoleRepository } from "@/entities/role/role.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!hasPermission(user, "users.roles")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;
  const repo = container.get<RoleRepository>("RoleRepository");

  try {
    const body = (await request.json()) as Record<string, unknown>;
    await repo.update(id, {
      name: body.name as string,
      description: body.description as string,
      level: body.level as number,
      permissions: body.permissions as string[],
    });

    await createAuditLog({
      userId: user!.id, action: "UPDATE", entity: "Role", entityId: id,
      details: { changes: Object.keys(body) },
    });

    return NextResponse.json({ ok: true, data: { id } });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный запрос" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!hasPermission(user, "users.roles")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;
  const repo = container.get<RoleRepository>("RoleRepository");
  await repo.delete(id);

  await createAuditLog({
    userId: user!.id, action: "DELETE", entity: "Role", entityId: id, details: {},
  });

  return NextResponse.json({ ok: true, data: { deleted: id } });
}
