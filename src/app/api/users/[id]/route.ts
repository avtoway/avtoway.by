import "@/di/composition-root";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import type { UserRepository } from "@/entities/user/user.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getAuthUser();
  if (!currentUser) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  if (id !== currentUser.id && !hasPermission(currentUser, "users.manage")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const repo = container.get<UserRepository>("UserRepository");
  const data = await repo.getById(id);
  if (!data) {
    return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getAuthUser();
  if (!currentUser) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  if (id !== currentUser.id && !hasPermission(currentUser, "users.manage")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }
  const canAssignRoles = hasPermission(currentUser, "users.roles");

  const repo = container.get<UserRepository>("UserRepository");
  const existing = await repo.getById(id);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Пользователь не найден" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Check login uniqueness
    if (typeof body.login === "string") {
      const dup = await repo.getByLogin(body.login);
      if (dup && dup.id !== id) {
        return NextResponse.json({ ok: false, error: "Этот логин уже занят" }, { status: 409 });
      }
    }

    // Password change
    let hashedPassword: string | undefined;
    if (typeof body.newPassword === "string" && body.newPassword.length > 0) {
      if (body.newPassword.length < 6) {
        return NextResponse.json({ ok: false, error: "Минимум 6 символов" }, { status: 400 });
      }
      const auth = await repo.getByLogin(existing.login);
      if (!auth || !body.oldPassword || !await bcrypt.compare(body.oldPassword as string, auth.password)) {
        return NextResponse.json({ ok: false, error: "Неверный текущий пароль" }, { status: 403 });
      }
      hashedPassword = await bcrypt.hash(body.newPassword as string, 10);
    }

    // Update user
    const updateData: Record<string, unknown> = {};
    for (const field of ["login", "name", "email", "phone", "photo", "position",
      "birthDate", "workSchedule", "hireDate", "telegram", "bio"]) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }
    await repo.update(id, updateData, hashedPassword);

    // Update roles
    if (Array.isArray(body.roleIds)) {
      if (!canAssignRoles) {
        return NextResponse.json({ ok: false, error: "Нет прав для назначения ролей" }, { status: 403 });
      }
      await repo.assignRoles(id, body.roleIds as string[]);
    }

    await createAuditLog({
      userId: currentUser!.id, action: "UPDATE", entity: "User", entityId: id,
      details: { changes: Object.keys(body) },
    });

    const data = await repo.getById(id);
    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный запрос" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await getAuthUser();
  if (!hasPermission(currentUser, "users.manage")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const { id } = await params;
  if (id === currentUser!.id) {
    return NextResponse.json({ ok: false, error: "Нельзя удалить себя" }, { status: 400 });
  }

  const repo = container.get<UserRepository>("UserRepository");
  await repo.delete(id);

  await createAuditLog({
    userId: currentUser!.id, action: "DELETE", entity: "User", entityId: id, details: {},
  });

  return NextResponse.json({ ok: true, data: { deleted: id } });
}
