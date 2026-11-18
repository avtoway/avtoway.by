import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "@/lib/auth-token";

const base = {
  id: "user-1",
  name: "Admin",
  role: "Администратор",
  permissions: ["users.manage", "audit.view"],
};

describe("auth token", () => {
  it("signs and verifies a token", () => {
    const token = signToken(base);
    const payload = verifyToken(token);
    expect(payload?.id).toBe("user-1");
    expect(payload?.permissions).toContain("users.manage");
    expect(payload!.exp * 1000).toBeGreaterThan(Date.now());
  });

  it("rejects a tampered payload", () => {
    const token = signToken(base);
    const [body, signature] = token.split(".");
    const forged = Buffer.from(
      JSON.stringify({ ...base, role: "Hacker", exp: Math.floor(Date.now() / 1000) + 3600 }),
    ).toString("base64url");
    expect(verifyToken(`${forged}.${signature}`)).toBeNull();
    expect(verifyToken(`${body}.${signature}x`)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifyToken("")).toBeNull();
    expect(verifyToken("no-dot")).toBeNull();
    expect(verifyToken("a.b")).toBeNull();
  });
});
