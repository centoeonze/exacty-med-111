import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(serverRoot, "..");

// Repo .env (CMS_USERNAME/PASSWORD) then server/.env (DATABASE_URL)
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(serverRoot, ".env") });

// Stable SQLite path (Docker volumes / EasyPanel cwd-independent).
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:./")) {
  process.env.DATABASE_URL = `file:${path
    .join(serverRoot, "prisma", "cms.db")
    .replace(/\\/g, "/")}`;
}

import { createApp } from "./app.js";
import { serverConfig } from "./config/env.js";
import { AuthService } from "./services/AuthService.js";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";

/** Prefer repo `dist/` (Vite build); fall back to `server/dist` if present. */
const resolveSpaDir = (): string | undefined => {
  const candidates = [path.join(repoRoot, "dist"), path.join(serverRoot, "dist")];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, "index.html"))) return dir;
  }
  return undefined;
};

const runMigrations = () => {
  try {
    execFileSync("npx", ["prisma", "migrate", "deploy"], {
      cwd: serverRoot,
      env: process.env,
      stdio: "inherit",
      shell: true,
    });
  } catch (error) {
    console.error("[exacty-cms-api] prisma migrate deploy failed:", error);
    throw error;
  }
};

const serveSpaDir = resolveSpaDir();
const uploadsDir = path.join(serverRoot, "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(path.join(serverRoot, "prisma"), { recursive: true });

const bootstrap = async () => {
  // Volumes on EasyPanel often mount an empty prisma dir — migrate on every boot.
  runMigrations();

  const app = createApp({ serveSpaDir, uploadsDir });

  try {
    const auth = new AuthService(getPrismaClient());
    const result = await auth.ensureBootstrapUserFromEnv();
    if (result?.created) {
      console.log(`[exacty-cms-api] bootstrap user created: ${result.email}`);
    } else if (result) {
      console.log(`[exacty-cms-api] bootstrap user ready: ${result.email}`);
    }
  } catch (error) {
    console.warn("[exacty-cms-api] bootstrap user failed:", error);
  }

  // 0.0.0.0 — required for EasyPanel / Docker / reverse-proxy.
  app.listen(serverConfig.port, "0.0.0.0", () => {
    console.log(
      `[exacty-cms-api] listening on http://0.0.0.0:${serverConfig.port}`,
    );
    console.log(`[exacty-cms-api] NODE_ENV=${process.env.NODE_ENV || "undefined"}`);
    console.log(
      `[exacty-cms-api] CMS_USERNAME set=${Boolean(String(process.env.CMS_USERNAME || "").trim())}`,
    );
    console.log(`[exacty-cms-api] storage backend: sqlite (Prisma)`);
    console.log(`[exacty-cms-api] uploads dir: ${uploadsDir}`);
    console.log(
      `[exacty-cms-api] routes: GET /api/health, /api/storage, /api/assets, /api/auth, POST /api/assets/upload`,
    );
    if (serveSpaDir) {
      console.log(`[exacty-cms-api] serving SPA from ${serveSpaDir}`);
    } else {
      console.log(
        `[exacty-cms-api] SPA not found (no dist/index.html) — API-only mode. Run build:hostinger / Docker build first.`,
      );
    }
  });
};

void bootstrap();
