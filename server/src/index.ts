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

const serveSpaDir = resolveSpaDir();
const app = createApp({ serveSpaDir });

const bootstrap = async () => {
  try {
    const auth = new AuthService(getPrismaClient());
    const result = await auth.ensureBootstrapUserFromEnv();
    if (result?.created) {
      console.log(`[exacty-cms-api] bootstrap user created: ${result.email}`);
    } else if (result) {
      console.log(`[exacty-cms-api] bootstrap user ready: ${result.email}`);
    }
  } catch (error) {
    console.warn("[exacty-cms-api] bootstrap user skipped:", error);
  }

  app.listen(serverConfig.port, () => {
    console.log(`[exacty-cms-api] listening on http://localhost:${serverConfig.port}`);
    console.log(`[exacty-cms-api] storage backend: sqlite (Prisma)`);
    if (serveSpaDir) {
      console.log(`[exacty-cms-api] serving SPA from ${serveSpaDir}`);
    } else {
      console.log(
        `[exacty-cms-api] SPA not found (no dist/index.html) — API-only mode`,
      );
    }
  });
};

void bootstrap();
