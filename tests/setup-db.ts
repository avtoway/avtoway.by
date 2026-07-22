import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { randomUUID } from "node:crypto";

let testPrisma: PrismaClient | null = null;

export function getTestDb(): PrismaClient {
  if (testPrisma) return testPrisma;

  const adapter = new PrismaLibSql({ url: "file:./data/test.db" });
  testPrisma = new PrismaClient({ adapter });
  return testPrisma;
}

export async function createTestUser(prisma: PrismaClient, overrides: Record<string, any> = {}) {
  const id = overrides.id ?? randomUUID();
  const login = overrides.login ?? `test_${randomUUID().slice(0, 8)}`;

  await prisma.user.create({
    data: {
      id,
      login,
      password: "$2a$10$test",
      profile: {
        create: {
          id: randomUUID(),
          name: overrides.name ?? "Test User",
          email: overrides.email ?? `${login}@test.com`,
        },
      },
    },
  });

  return { id, login };
}

export async function createTestRole(prisma: PrismaClient, overrides: Record<string, any> = {}) {
  const id = overrides.id ?? randomUUID();
  const name = overrides.name ?? `role_${randomUUID().slice(0, 8)}`;

  await prisma.role.create({
    data: {
      id,
      name,
      description: overrides.description ?? "Test role",
      level: overrides.level ?? 0,
      permissions: {
        create: (overrides.permissions ?? []).map((p: string) => ({ permission: p })),
      },
    },
  });

  return { id, name };
}
