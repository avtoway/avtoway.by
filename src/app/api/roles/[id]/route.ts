import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ForbiddenError, toApiError } from "@/shared/lib/errors";
import { RoleSchema } from "@/entities/role/role.schema";
import type { RoleRepository } from "@/entities/role/role.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!hasPermission(user, "users.roles")) throw new ForbiddenError();

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(RoleSchema, body);
    if (!("validated" in parsed)) return parsed;

    const repo = container.get<RoleRepository>("RoleRepository");
    await repo.update(id, {
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
    const repo = container.get<RoleRepository>("RoleRepository");
    await repo.delete(id);

    await createAuditLog({
      userId: user!.id, action: "DELETE", entity: "Role", entityId: id, details: {},
    });

    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}