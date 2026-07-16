import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    env: {
      YOUTUBE_API_KEY: "test-key",
      YOUTUBE_CHANNEL_ID: "test-channel",
      AUTH_SECRET: "test-secret",
    },
    reporters: [
      "default",
      "allure-vitest/reporter",
    ],
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
