import { getPrismaClient } from "./prisma.client";
import type { UserRepository, CreateUserInput, UpdateUserInput } from "@/entities/user/user.repository";
import type { UserWithRoles } from "@/entities/user/user";
import { randomUUID } from "node:crypto";

function toUserWithRoles(row: any): UserWithRoles {
  return {
    id: row.id,
    login: row.login,
    email: row.profile?.email ?? undefined,
    name: row.profile?.name ?? row.login,
    phone: row.profile?.phone ?? undefined,
    photo: row.profile?.photo ?? undefined,
    position: row.profile?.position ?? undefined,
    birthDate: row.profile?.birthDate ?? undefined,
    workSchedule: row.profile?.workSchedule ?? "full_time",
    hireDate: row.profile?.hireDate ?? undefined,
    telegram: row.profile?.telegram ?? undefined,
    bio: row.profile?.bio ?? undefined,
    roles: row.roles?.map((ur: any) => ({ id: ur.role.id, name: ur.role.name })) ?? [],
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
  };
}

export class PrismaUserRepository implements UserRepository {
  private get db() { return getPrismaClient(); }

  async getAll(): Promise<UserWithRoles[]> {
    const rows = await this.db.user.findMany({
      include: { profile: true, roles: { include: { role: true } } },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(toUserWithRoles);
  }

  async getById(id: string): Promise<UserWithRoles | null> {
    const row = await this.db.user.findUnique({
      where: { id },
      include: { profile: true, roles: { include: { role: true } } },
    });
    return row ? toUserWithRoles(row) : null;
  }

  async getByLogin(login: string): Promise<{ id: string; login: string; name: string; photo: string | null; password: string } | null> {
    const row = await this.db.user.findUnique({
      where: { login },
      include: { profile: true },
    });
    if (!row) return null;
    return {
      id: row.id,
      login: row.login,
      name: row.profile?.name ?? row.login,
      photo: row.profile?.photo ?? null,
      password: row.password,
    };
  }

  async create(data: CreateUserInput & { id: string; hashedPassword: string }): Promise<void> {
    await this.db.user.create({
      data: {
        id: data.id,
        login: data.login,
        password: data.hashedPassword,
        profile: {
          create: {
            id: randomUUID(),
            name: data.name ?? data.login,
            email: data.email ?? null,
            phone: data.phone ?? null,
            photo: data.photo ?? null,
            position: data.position ?? null,
            birthDate: data.birthDate ?? null,
            workSchedule: data.workSchedule ?? "full_time",
            hireDate: data.hireDate ?? null,
            telegram: data.telegram ?? null,
            bio: data.bio ?? null,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateUserInput, hashedPassword?: string): Promise<void> {
    const userData: Record<string, unknown> = {};
    if (data.login) userData.login = data.login;
    if (hashedPassword) userData.password = hashedPassword;
    if (Object.keys(userData).length > 0) {
      await this.db.user.update({ where: { id }, data: userData });
    }

    const profileFields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (["name", "email", "phone", "photo", "position", "birthDate",
           "workSchedule", "hireDate", "telegram", "bio"].includes(k)) {
        profileFields[k] = v ?? null;
      }
    }
    if (Object.keys(profileFields).length > 0) {
      const existing = await this.db.profile.findUnique({ where: { userId: id } });
      if (existing) {
        await this.db.profile.update({ where: { userId: id }, data: profileFields });
      } else {
        await this.db.profile.create({
          data: { id: randomUUID(), userId: id, ...profileFields } as any,
        });
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.userRole.deleteMany({ where: { userId: id } });
    await this.db.profile.deleteMany({ where: { userId: id } });
    await this.db.user.delete({ where: { id } });
  }

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.db.userRole.deleteMany({ where: { userId } });
    for (const roleId of roleIds) {
      await this.db.userRole.create({ data: { userId, roleId } });
    }
  }

  async updateProfile(id: string, data: Record<string, unknown>): Promise<void> {
    const existing = await this.db.profile.findUnique({ where: { userId: id } });
    if (existing) {
      await this.db.profile.update({ where: { userId: id }, data: data as any });
    } else {
      await this.db.profile.create({
        data: { id: randomUUID(), userId: id, ...data } as any,
      });
    }
  }
}
