import "@/di/composition-root";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ForbiddenError, ConflictError, toApiError } from "@/shared/lib/errors";
import { assertCanAssignRoles } from "@/lib/authz.server";
import { UserCreateSchema } from "@/entities/user/user.schema";
import type { UserRepository } from "@/entities/user/user.repository";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!hasPermission(user, "users.manage")) throw new ForbiddenError();
    const repo = container.get<UserRepository>("UserRepository");
    return NextResponse.json({ ok: true, data: await repo.getAll() });
  } catch (e) {
    return toApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getAuthUser();
    if (!hasPermission(currentUser, "users.manage")) throw new ForbiddenError();

    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(UserCreateSchema, body);
    if (!("validated" in parsed)) return parsed;

    const { login, password, name, email, roleIds } = parsed.data;

    const repo = container.get<UserRepository>("UserRepository");
    const existing = await repo.getByLogin(login);
    if (existing) throw new ConflictError("Логин уже занят");

    if (roleIds?.length) {
      if (!hasPermission(currentUser, "users.roles")) throw new ForbiddenError("Нет прав для назначения ролей");
      await assertCanAssignRoles(currentUser!, roleIds);
    }

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
      await repo.assignRoles(id, roleIds);
    }

    const created = await repo.getById(id);

    await createAuditLog({
      userId: currentUser!.id, action: "CREATE", entity: "User", entityId: id,
      details: { login, roles: created?.roles ?? [] },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e) {
    return toApiError(e);
  }
}
