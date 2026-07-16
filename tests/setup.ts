import { beforeEach, vi } from "vitest";

// Mock server-only module (used by server components)
vi.mock("server-only", () => ({}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/headers (used in auth.server.ts)
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: () => undefined,
  }),
}));

beforeEach(() => {
  document.documentElement.innerHTML = "";
});
