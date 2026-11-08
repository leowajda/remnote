import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: "**/touch.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      testIgnore: "**/touch.spec.ts",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "android",
      testMatch: "**/touch.spec.ts",
      use: { ...devices["Pixel 7"], browserName: "chromium" },
    },
    {
      name: "ios",
      testMatch: "**/touch.spec.ts",
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
