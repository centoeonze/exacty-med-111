import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Compatibility baseline — Stage 7 runs against default provider (API).
 * Port 8083 avoids clashing with a leftover local Vite on 8080.
 */
export default defineConfig({
  testDir: ".",
  timeout: 90_000,
  use: {
    baseURL: "http://localhost:8083",
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
      command: "npx vite --port 8083 --strictPort",
      cwd: rootDir,
      url: "http://localhost:8083",
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
