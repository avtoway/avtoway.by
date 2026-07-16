import "@/di/composition-root";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { container } from "@/di/container";
import { getAuthUser, hasPermission } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
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

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const login = body.login as string;
    const password = body.password as string;

    if (!login || !password) {
      return NextResponse.json({ ok: false, error: "Логин и пароль обязательны" }, { status: 400 });
    }

    const repo = container.get<UserRepository>("UserRepository");
    const existing = await repo.getByLogin(login);
    if (existing) {
      return NextResponse.json({ ok: false, error: "Логин уже занят" }, { status: 409 });
    }

    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);
    await repo.create({
      id,
      login,
      hashedPassword,
      name: (body.name as string) || login,
      email: body.email as string,
      phone: body.phone as string,
      photo: body.photo as string,
      position: body.position as string,
      birthDate: body.birthDate as string,
      workSchedule: (body.workSchedule as string) ?? "full_time",
      hireDate: body.hireDate as string,
      telegram: body.telegram as string,
      bio: body.bio as string,
    });

    if (Array.isArray(body.roleIds)) {
      if (!hasPermission(currentUser, "users.roles")) {
        return NextResponse.json({ ok: false, error: "Нет прав для назначения ролей" }, { status: 403 });
      }
      await repo.assignRoles(id, body.roleIds as string[]);
    }

    const created = await repo.getById(id);

    await createAuditLog({
      userId: currentUser!.id, action: "CREATE", entity: "User", entityId: id,
      details: { login, roles: created?.roles ?? [] },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Неверный запрос";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
