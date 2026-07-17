import { defineConfig, devices } from "@playwright/test";

/**
 * Stage 5 — CMS with STORAGE_PROVIDER=api (vite --mode api).
 * Starts Express API + Vite; requires CMS credentials in .env.
 */
export default defineConfig({
  testDir: ".",
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:8080",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev:api",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npm run dev:cms-api",
      url: "http://localhost:8080",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`,
        },
      },
    },
  ],
});
