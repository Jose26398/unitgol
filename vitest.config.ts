import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    clearMocks: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: [
        "src/utils/**/*.ts",
        "src/db/**/*.ts",
        "src/hooks/**/*.ts",
        "src/features/**/utils/**/*.ts",
      ],
      exclude: ["src/__tests__/**", "src/**/*.d.ts", "src/db/supabase.ts"],
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 95,
        lines: 95,
      },
    },
  },
});
