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

const app = createApp();

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
  });
};

void bootstrap();
