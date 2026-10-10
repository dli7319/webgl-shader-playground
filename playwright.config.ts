import { defineConfig } from "@playwright/test";

/**
 * Integration tests drive the BUILT app (dist/) through an ephemeral static
 * server started in global setup — see tests/e2e/global-setup.ts.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:0",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
});
