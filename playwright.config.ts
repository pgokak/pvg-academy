import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e", // Directory where the test files are located.
  use: {
    baseURL: "http://localhost:3000", // Base URL for the application under test, used in `page.goto()` and similar methods.
  },
  webServer: {
    // Configuration for starting the application server before running tests.automatically starts npm run dev before running tests
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI, // Reuse the existing server if not running in CI, to speed up local test runs.
  },
});
