import "@/di/composition-root";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ForbiddenError, ConflictError, toApiError } from "@/shared/lib/errors";
import { UserCreateSchema } from "@/entities/user/user.schema";
import type { UserRepository } from "@/entities/user/user.repository";

export async function GET() {
  const user = await getAuthUser();
  if (!hasPermission(user, "users.manage")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const repo = container.get<UserRepository>("UserRepository");
  const users = await repo.getAll();
  return NextResponse.json({ ok: true, data: users });
}

export async function POST(request: Request) {
  const currentUser = await getAuthUser();
  if (!hasPermission(currentUser, "users.manage")) {
    return NextResponse.json({ ok: false, error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = validateOrResponse(UserCreateSchema, body);
  if (!("validated" in parsed)) return parsed;

  const { login, password, name, email, roleIds } = parsed.data;

  const repo = container.get<UserRepository>("UserRepository");
  const existing = await repo.getByLogin(login);
  if (existing) throw new ConflictError("Логин уже занят");

  const id = randomUUID();
  const hashedPassword = await bcrypt.hash(password, 10);
  await repo.create({
    id, login, hashedPassword,
    name: name || login,
    email: email || undefined,
    phone: undefined, photo: undefined,
    position: undefined, birthDate: undefined,
    workSchedule: "full_time", hireDate: undefined,
    telegram: undefined, bio: undefined,
  });

  if (roleIds?.length) {
    if (!hasPermission(currentUser, "users.roles")) throw new ForbiddenError("Нет прав для назначения ролей");
    await repo.assignRoles(id, roleIds);
  }

  const created = await repo.getById(id);

  await createAuditLog({
    userId: currentUser!.id, action: "CREATE", entity: "User", entityId: id,
    details: { login, roles: created?.roles ?? [] },
  });

  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}
