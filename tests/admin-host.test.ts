import { describe, expect, it } from "vitest";
import { isAdminHostAllowed } from "@/shared/lib/admin-host";

const opts = { siteUrl: "https://avtoway.by", allowedHosts: "" };

describe("isAdminHostAllowed", () => {
  it("allows local addresses", () => {
    expect(isAdminHostAllowed("localhost:3001", opts)).toBe(true);
    expect(isAdminHostAllowed("127.0.0.1:3000", opts)).toBe(true);
    expect(isAdminHostAllowed("[::1]:3001", opts)).toBe(true);
  });

  it("allows only the production domain", () => {
    expect(isAdminHostAllowed("avtoway.by", opts)).toBe(true);
    expect(isAdminHostAllowed("www.avtoway.by", opts)).toBe(false);
  });

  it("blocks public tunnels", () => {
    for (const host of [
      "bore.pub:1745",
      "abc-def.trycloudflare.com",
      "abc.ngrok-free.app",
      "abc.loca.lt",
      "abc.localhost.run",
      "10.0.122.163:3001",
    ]) {
      expect(isAdminHostAllowed(host, opts), host).toBe(false);
    }
  });

  it("respects the allow list", () => {
    expect(
      isAdminHostAllowed("staging.avtoway.by", { ...opts, allowedHosts: "staging.avtoway.by, admin.test" }),
    ).toBe(true);
    expect(isAdminHostAllowed("admin.test:8443", { ...opts, allowedHosts: "staging.avtoway.by, admin.test" })).toBe(true);
  });

  it("does not fail open on broken configuration", () => {
    expect(isAdminHostAllowed("avtoway.by", { siteUrl: "not a url", allowedHosts: "" })).toBe(false);
    expect(isAdminHostAllowed("", opts)).toBe(false);
  });
});
