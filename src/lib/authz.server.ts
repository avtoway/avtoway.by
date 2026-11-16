import "@/di/composition-root";
import { container } from "@/di/container";
import { ForbiddenError } from "@/shared/lib/errors";
import type { RoleRepository } from "@/entities/role/role.repository";
import type { AuthUser } from "@/lib/auth.server";

/** Уровень «Администратор»: полный доступ без ограничений иерархии. */
export const SUPERUSER_LEVEL = 100;

function roleRepo(): RoleRepository {
  return container.get<RoleRepository>("RoleRepository");
}

/** Максимальный уровень среди ролей пользователя (0 — ролей нет). */
export async function getMaxRoleLevel(roleIds: string[]): Promise<number> {
  if (roleIds.length === 0) return 0;
  const roles = await roleRepo().getAll();
  const levels = new Map(roles.map(role => [role.id, role.level]));
  return roleIds.reduce((max, id) => Math.max(max, levels.get(id) ?? 0), 0);
}

/**
 * Нельзя изменять или удалять сотрудника с ролью не ниже своей.
 * Администратор (уровень 100) может управлять всеми.
 */
export async function assertCanManageUser(
  actor: AuthUser,
  targetRoleIds: string[],
): Promise<void> {
  if (actor.level >= SUPERUSER_LEVEL) return;
  const targetLevel = await getMaxRoleLevel(targetRoleIds);
  if (targetLevel >= actor.level) {
    throw new ForbiddenError("Недостаточно прав для управления этим сотрудником");
  }
}

/** Нельзя выдать роль с уровнем не ниже собственного. */
export async function assertCanAssignRoles(
  actor: AuthUser,
  roleIds: string[],
): Promise<void> {
  if (roleIds.length === 0) return;
  if (actor.level >= SUPERUSER_LEVEL) return;

  const roles = await roleRepo().getAll();
  const requested = roles.filter(role => roleIds.includes(role.id));
  const tooHigh = requested.find(role => role.level >= actor.level);
  if (tooHigh) {
    throw new ForbiddenError("Нельзя назначить роль не ниже своей");
  }
}
