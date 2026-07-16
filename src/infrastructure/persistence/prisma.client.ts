import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const adapter = new PrismaLibSql({
    url: process.env.PRISMA_DATABASE_URL ?? "file:../data/avtoway.db",
  });
  const prisma = new PrismaClient({ adapter });

  globalForPrisma.prisma = prisma;
  return prisma;
}
