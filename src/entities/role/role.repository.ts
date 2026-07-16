import type { Role } from "./role";

export interface RoleRepository {
  getAll(): Promise<Role[]>;
  create(data: { name: string; description?: string; level: number; permissions: string[] }): Promise<Role>;
  update(id: string, data: { name?: string; description?: string; level?: number; permissions?: string[] }): Promise<void>;
  delete(id: string): Promise<void>;
}
