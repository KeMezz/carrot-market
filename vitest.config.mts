import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@libs": path.resolve(import.meta.dirname, "libs"),
      "@components": path.resolve(import.meta.dirname, "components"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: { SESSION_PW: "test-secret-0123456789abcdef0123456789abcdef" },
  },
});
