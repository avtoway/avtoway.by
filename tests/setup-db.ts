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

export async function createTestUser(prisma: PrismaClient, overrides: Record<string, unknown> = {}) {
  const id = typeof overrides.id === "string" ? overrides.id : randomUUID();
  const login = typeof overrides.login === "string" ? overrides.login : `test_${randomUUID().slice(0, 8)}`;
  const name = typeof overrides.name === "string" ? overrides.name : "Test User";
  const email = typeof overrides.email === "string" ? overrides.email : `${login}@test.com`;

  await prisma.user.create({
    data: {
      id,
      login,
      password: "$2a$10$test",
      profile: {
        create: {
          id: randomUUID(),
          name,
          email,
        },
      },
    },
  });

  return { id, login };
}

export async function createTestRole(prisma: PrismaClient, overrides: Record<string, unknown> = {}) {
  const id = typeof overrides.id === "string" ? overrides.id : randomUUID();
  const name = typeof overrides.name === "string" ? overrides.name : `role_${randomUUID().slice(0, 8)}`;
  const description = typeof overrides.description === "string" ? overrides.description : "Test role";
  const level = typeof overrides.level === "number" ? overrides.level : 0;
  const permissions = Array.isArray(overrides.permissions) ? overrides.permissions.map(String) : [];

  await prisma.role.create({
    data: {
      id,
      name,
      description,
      level,
      permissions: {
        create: permissions.map(permission => ({ permission })),
      },
    },
  });

  return { id, name };
}
