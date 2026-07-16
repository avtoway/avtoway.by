import { describe, it, expect, vi, beforeEach } from "vitest";

describe("AuditLogRepository", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should be defined in DI container", async () => {
    // Since the DI container is set up in composition-root,
    // we can test that the import works without error
    await expect(import("@/di/composition-root")).resolves.toBeDefined();
  });

  it("should have correct methods signature", async () => {
    const { PrismaAuditLogRepository } = await import("@/infrastructure/persistence/audit.prisma.repository");
    const repo = new PrismaAuditLogRepository();
    expect(repo.getAll).toBeDefined();
    expect(repo.create).toBeDefined();
    expect(typeof repo.getAll).toBe("function");
    expect(typeof repo.create).toBe("function");
  });
});
