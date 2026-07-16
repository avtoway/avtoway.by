import { describe, it, expect } from "vitest";

describe("Auth utilities", () => {
  describe("hasPermission", () => {
    it("should return true when user has the permission", async () => {
      const { hasPermission } = await import("@/lib/auth.server");
      const user = { id: "1", login: "admin", name: "Admin", role: "Администратор", permissions: ["users.manage", "audit.view"] };
      expect(hasPermission(user, "users.manage")).toBe(true);
      expect(hasPermission(user, "audit.view")).toBe(true);
    });

    it("should return false when user lacks the permission", async () => {
      const { hasPermission } = await import("@/lib/auth.server");
      const user = { id: "1", login: "viewer", name: "Viewer", role: "Наблюдатель", permissions: ["services.view"] };
      expect(hasPermission(user, "users.manage")).toBe(false);
    });

    it("should return false for null user", async () => {
      const { hasPermission } = await import("@/lib/auth.server");
      expect(hasPermission(null, "anything")).toBe(false);
    });
  });

  describe("verifyToken", () => {
    it("should return null for invalid token", async () => {
      const { verifyToken } = await import("@/lib/auth.server");
      expect(verifyToken("invalid")).toBeNull();
      expect(verifyToken("")).toBeNull();
      expect(verifyToken("abc.def")).toBeNull();
    });
  });

  describe("signTokenFromUser", () => {
    it("should produce a valid token that can be verified", async () => {
      const { signTokenFromUser, verifyToken } = await import("@/lib/auth.server");
      const user = { id: "1", login: "admin", name: "Admin", role: "Администратор", permissions: ["users.manage"] };
      const token = await signTokenFromUser(user as any);
      expect(token).toContain(".");
      const decoded = verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.id).toBe("1");
      expect(decoded!.name).toBe("Admin");
    });
  });
});
