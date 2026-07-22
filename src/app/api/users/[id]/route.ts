import "@/di/composition-root";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { AuthError, ForbiddenError, NotFoundError, ValidationError, ConflictError, toApiError } from "@/shared/lib/errors";
import { ProfileUpdateSchema } from "@/entities/user/user.schema";
import type { UserRepository } from "@/entities/user/user.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser) throw new AuthError();

    const { id } = await params;
    if (id !== currentUser.id && !hasPermission(currentUser, "users.manage")) throw new ForbiddenError();

    const repo = container.get<UserRepository>("UserRepository");
    const data = await repo.getById(id);
    if (!data) throw new NotFoundError("Пользователь не найден");

    return NextResponse.json({ ok: true, data });
  } catch (e) { return toApiError(e); }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser) throw new AuthError();

    const { id } = await params;
    if (id !== currentUser.id && !hasPermission(currentUser, "users.manage")) throw new ForbiddenError();
    const canAssignRoles = hasPermission(currentUser, "users.roles");

    const repo = container.get<UserRepository>("UserRepository");
    const existing = await repo.getById(id);
    if (!existing) throw new NotFoundError("Пользователь не найден");

    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(ProfileUpdateSchema, body);
    if (!("validated" in parsed)) return parsed;

    let hashedPassword: string | undefined;
    if (typeof body.newPassword === "string" && body.newPassword.length > 0) {
      if (body.newPassword.length < 6) throw new ValidationError("Минимум 6 символов");
      const auth = await repo.getByLogin(existing.login);
      if (!auth || !body.oldPassword || !await bcrypt.compare(body.oldPassword as string, auth.password)) {
        throw new ForbiddenError("Неверный текущий пароль");
      }
      hashedPassword = await bcrypt.hash(body.newPassword as string, 10);
    }

    const updateData: Record<string, unknown> = {};
    for (const field of ["name", "email", "phone", "photo", "position",
      "birthDate", "workSchedule", "hireDate", "telegram", "bio"]) {
      if ((body as Record<string, unknown>)[field] !== undefined) updateData[field] = (body as Record<string, unknown>)[field];
    }
    if (typeof body.login === "string") {
      const dup = await repo.getByLogin(body.login);
      if (dup && dup.id !== id) throw new ConflictError("Этот логин уже занят");
      updateData.login = body.login;
    }
    await repo.update(id, updateData, hashedPassword);

    if (Array.isArray(body.roleIds)) {
      if (!canAssignRoles) throw new ForbiddenError("Нет прав для назначения ролей");
      await repo.assignRoles(id, body.roleIds as string[]);
    }

    await createAuditLog({
      userId: currentUser!.id, action: "UPDATE", entity: "User", entityId: id,
      details: { changes: Object.keys(body) },
    });

    const data = await repo.getById(id);
    return NextResponse.json({ ok: true, data });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getAuthUser();
    if (!hasPermission(currentUser, "users.manage")) throw new ForbiddenError();

    const { id } = await params;
    if (id === currentUser!.id) throw new ValidationError("Нельзя удалить себя");

    const repo = container.get<UserRepository>("UserRepository");
    await repo.delete(id);

    await createAuditLog({
      userId: currentUser!.id, action: "DELETE", entity: "User", entityId: id, details: {},
    });

    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}