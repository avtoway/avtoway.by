import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    testTimeout: 15_000,
    env: {
      YOUTUBE_API_KEY: "test-key",
      YOUTUBE_CHANNEL_ID: "test-channel",
      AUTH_SECRET: "test-secret",
      ENCRYPTION_KEY: "test-encryption-key",
    },
    exclude: ["**/node_modules/**", ".next/**", "tests/e2e/**", "mcp/**"],
    reporters: [
      "default",
      "allure-vitest/reporter",
    ],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/lib/auth-token.ts",
        "src/shared/lib/price.ts",
        "src/shared/lib/slug.ts",
        "src/shared/lib/rate-limiter.ts",
        "src/shared/lib/image-type.ts",
        "src/features/calculator/lib/customs.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
