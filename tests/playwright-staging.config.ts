import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Stage 6 — API as primary provider (vite --mode staging / .env.staging).
 * Uses port 8082 so a leftover `npm run dev` on 8080 cannot mask the provider.
 */
export default defineConfig({
  testDir: ".",
  timeout: 120_000,
  use: {
    baseURL: "http://localhost:8082",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev:api",
      cwd: rootDir,
      url: "http://localhost:3001/api/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npx vite --mode staging --port 8082 --strictPort",
      cwd: rootDir,
      url: "http://localhost:8082",
      reuseExistingServer: false,
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
