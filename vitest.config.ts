import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.ts", "src/globals.d.ts"],
      thresholds: {
        // Per-file floors for modules that have suites. Global thresholds get
        // tightened as the refactor PRs bring the components under test.
        "**/glsl.ts": {
          lines: 95,
          functions: 95,
          branches: 80,
        },
      },
    },
  },
});
