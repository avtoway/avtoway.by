import { getPrismaClient } from "./prisma.client";
import type { RoleRepository } from "@/entities/role/role.repository";
import type { Role } from "@/entities/role/role";
import { randomUUID } from "node:crypto";

function toRole(row: any): Role {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    level: row.level,
    permissions: row.permissions?.map((rp: any) => rp.permission) ?? [],
  };
}

export class PrismaRoleRepository implements RoleRepository {
  private get db() { return getPrismaClient(); }

  async getAll(): Promise<Role[]> {
    const rows = await this.db.role.findMany({
      include: { permissions: true },
      orderBy: { level: "desc" },
    });
    return rows.map(toRole);
  }

  async create(data: { name: string; description?: string; level: number; permissions: string[] }): Promise<Role> {
    const id = randomUUID();
    await this.db.role.create({
      data: {
        id,
        name: data.name,
        description: data.description ?? null,
        level: data.level,
        permissions: {
          create: data.permissions.map(p => ({ permission: p })),
        },
      },
    });
    return { id, name: data.name, description: data.description ?? null, level: data.level, permissions: data.permissions };
  }

  async update(id: string, data: { name?: string; description?: string; level?: number; permissions?: string[] }): Promise<void> {
    const roleData: Record<string, unknown> = {};
    if (data.name !== undefined) roleData.name = data.name;
    if (data.description !== undefined) roleData.description = data.description;
    if (data.level !== undefined) roleData.level = data.level;
    if (Object.keys(roleData).length > 0) {
      await this.db.role.update({ where: { id }, data: roleData });
    }
    if (data.permissions) {
      await this.db.rolePermission.deleteMany({ where: { roleId: id } });
      for (const perm of data.permissions) {
        await this.db.rolePermission.create({ data: { roleId: id, permission: perm } });
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.rolePermission.deleteMany({ where: { roleId: id } });
    await this.db.userRole.deleteMany({ where: { roleId: id } });
    await this.db.role.delete({ where: { id } });
  }
}
