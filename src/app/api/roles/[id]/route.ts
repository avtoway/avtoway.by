import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ForbiddenError, NotFoundError, toApiError } from "@/shared/lib/errors";
import { SUPERUSER_LEVEL } from "@/lib/authz.server";
import { RoleSchema } from "@/entities/role/role.schema";
import type { RoleRepository } from "@/entities/role/role.repository";

function roleRepo(): RoleRepository {
  return container.get<RoleRepository>("RoleRepository");
}

async function loadRole(id: string) {
  const role = (await roleRepo().getAll()).find(item => item.id === id);
  if (!role) throw new NotFoundError("Роль не найдена");
  return role;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!hasPermission(user, "users.roles")) throw new ForbiddenError();

    const { id } = await params;
    const existing = await loadRole(id);

    // Нельзя менять роль не ниже своей и поднять её до своего уровня (кроме администратора).
    const actorLevel = user!.level ?? 0;
    if (actorLevel < SUPERUSER_LEVEL) {
      if (existing.level >= actorLevel) throw new ForbiddenError("Недостаточно прав для изменения этой роли");
    }

    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(RoleSchema, body);
    if (!("validated" in parsed)) return parsed;

    if (actorLevel < SUPERUSER_LEVEL && parsed.data.level >= actorLevel) {
      throw new ForbiddenError("Нельзя установить уровень роли не ниже своего");
    }

    await roleRepo().update(id, {
      name: parsed.data.name,
      description: parsed.data.description || undefined,
      level: parsed.data.level,
      permissions: parsed.data.permissions ?? [],
    });

    await createAuditLog({
      userId: user!.id, action: "UPDATE", entity: "Role", entityId: id,
      details: { changes: Object.keys(body) },
    });

    return NextResponse.json({ ok: true, data: { id } });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!hasPermission(user, "users.roles")) throw new ForbiddenError();

    const { id } = await params;
    const existing = await loadRole(id);

    const actorLevel = user!.level ?? 0;
    if (actorLevel < SUPERUSER_LEVEL && existing.level >= actorLevel) {
      throw new ForbiddenError("Недостаточно прав для удаления этой роли");
    }

    await roleRepo().delete(id);

    await createAuditLog({
      userId: user!.id, action: "DELETE", entity: "Role", entityId: id,
      details: { name: existing.name },
    });

    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}
