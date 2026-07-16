import "@/di/composition-root";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { container } from "@/di/container";
import type { UserRepository } from "@/entities/user/user.repository";

const SECRET = process.env.AUTH_SECRET ?? "dev-secret";

export interface AuthUser {
  id: string;
  login: string;
  name: string;
  photo?: string;
  role: string;
  permissions: string[];
}

export async function verifyLogin(login: string, password: string, bcrypt: { compare: (s: string, hash: string) => Promise<boolean> }): Promise<AuthUser | null> {
  const repo = container.get<UserRepository>("UserRepository");
  const user = await repo.getByLogin(login);
  if (!user) return null;
  if (!await bcrypt.compare(password, user.password)) return null;
  return loadUser(user.id, user.name, user.login, user.photo ?? undefined);
}

async function loadUser(id: string, name: string, login?: string, _photo?: string): Promise<AuthUser> {
  const repo = container.get<UserRepository>("UserRepository");
  const user = await repo.getById(id);
  if (!user) return { id, login: login ?? "", name, role: "Viewer", permissions: [] };

  const perms = new Set<string>();
  for (const role of user.roles) {
    const roleRepo = container.get<import("@/entities/role/role.repository").RoleRepository>("RoleRepository");
    const roles = await roleRepo.getAll();
    const found = roles.find(r => r.id === role.id);
    if (found) found.permissions.forEach(p => perms.add(p));
  }

  const firstRole = user.roles[0];
  const topRole = firstRole ? firstRole.name : "Viewer";
  return {
    id: user.id,
    login: user.login,
    name: user.name,
    photo: user.photo,
    role: topRole,
    permissions: [...perms],
  };
}

export async function signTokenFromUser(user: AuthUser): Promise<string> {
  const payload = Buffer.from(JSON.stringify({
    id: user.id, name: user.name, role: user.role, permissions: user.permissions,
  })).toString("base64");
  const sig = createHash("sha256").update(payload + SECRET).digest("hex").slice(0, 16);
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): AuthUser | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expectedSig = createHash("sha256").update(payload + SECRET).digest("hex").slice(0, 16);
  if (sig !== expectedSig) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const token = store.get("admin_token")?.value;
  if (!token) return null;
  const cached = verifyToken(token);
  if (!cached) return null;

  const repo = container.get<UserRepository>("UserRepository");
  const user = await repo.getById(cached.id);
  if (!user) return null;
  return loadUser(user.id, user.name, user.login, user.photo);
}

export function hasPermission(user: AuthUser | null, permission: string): boolean {
  return user?.permissions.includes(permission) ?? false;
}
