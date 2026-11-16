import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ForbiddenError, ConflictError, toApiError } from "@/shared/lib/errors";
import { SUPERUSER_LEVEL } from "@/lib/authz.server";
import { RoleSchema } from "@/entities/role/role.schema";
import type { RoleRepository } from "@/entities/role/role.repository";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!hasPermission(user, "users.roles")) throw new ForbiddenError();
    const repo = container.get<RoleRepository>("RoleRepository");
    return NextResponse.json({ ok: true, data: await repo.getAll() });
  } catch (e) {
    return toApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!hasPermission(user, "users.roles")) throw new ForbiddenError();

    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(RoleSchema, body);
    if (!("validated" in parsed)) return parsed;

    // Нельзя создать роль не ниже своей (кроме администратора).
    if ((user!.level ?? 0) < SUPERUSER_LEVEL && parsed.data.level >= (user!.level ?? 0)) {
      throw new ForbiddenError("Нельзя создать роль с уровнем не ниже своего");
    }

    const repo = container.get<RoleRepository>("RoleRepository");
    const existing = (await repo.getAll()).find(r => r.name === parsed.data.name);
    if (existing) throw new ConflictError("Роль уже существует");

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
  } catch (e) { return toApiError(e); }
}
