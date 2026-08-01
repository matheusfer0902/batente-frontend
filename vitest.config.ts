import path from "node:path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const shared = {
  environment: "jsdom" as const,
  globals: true,
  setupFiles: ["./test/setup/vitest.setup.ts"],
  restoreMocks: true,
  clearMocks: true,
  css: false,
  pool: "threads" as const,
};

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          ...shared,
          name: "unit",
          include: [
            "src/**/*.test.ts",
            "src/lib/**/*.test.ts",
            "src/services/**/*.test.ts",
            "middleware.test.ts",
          ],
          exclude: [
            "src/**/*.test.tsx",
            "src/hooks/**/*.test.ts",
            "test/**",
          ],
          testTimeout: 5_000,
        },
      },
      {
        extends: true,
        test: {
          ...shared,
          name: "component",
          include: ["src/**/*.test.tsx"],
          testTimeout: 5_000,
        },
      },
      {
        extends: true,
        test: {
          ...shared,
          name: "hook",
          include: ["src/hooks/**/*.test.ts", "src/hooks/**/*.test.tsx"],
          testTimeout: 5_000,
        },
      },
      {
        extends: true,
        test: {
          ...shared,
          name: "integration",
          include: ["test/integration/**/*.test.tsx"],
          testTimeout: 15_000,
        },
      },
      {
        extends: true,
        test: {
          ...shared,
          name: "contract",
          include: ["test/contracts/**/*.test.ts"],
          testTimeout: 15_000,
        },
      },
      {
        extends: true,
        test: {
          ...shared,
          name: "arch",
          include: ["test/arch/**/*.test.ts"],
          testTimeout: 5_000,
        },
      },
      {
        extends: true,
        test: {
          ...shared,
          name: "i18n",
          include: ["test/i18n/**/*.test.ts"],
          testTimeout: 5_000,
        },
      },
    ],
  },
});
