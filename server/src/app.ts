import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type ErrorRequestHandler } from "express";
import path from "node:path";
import { serverConfig } from "./config/env.js";
import { StorageController } from "./controllers/storage.controller.js";
import { AssetController } from "./controllers/asset.controller.js";
import { AuthController } from "./controllers/auth.controller.js";
import type { IStorageRepository } from "./repositories/IStorageRepository.js";
import { SqliteStorageRepository } from "./repositories/SqliteStorageRepository.js";
import { createHealthRouter } from "./routes/health.routes.js";
import { createStorageRouter } from "./routes/storage.routes.js";
import { createAssetRouter } from "./routes/asset.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { StorageService } from "./services/storage.service.js";
import { AssetService } from "./services/AssetService.js";
import { AuthService } from "./services/AuthService.js";

export type CreateAppOptions = {
  repository?: IStorageRepository;
  storageBackend?: "sqlite" | "memory";
  uploadsDir?: string;
  assetService?: AssetService;
  authService?: AuthService;
  /** When set (Hostinger Node), serve the Vite `dist/` SPA after API routes. */
  serveSpaDir?: string;
};

export const createApp = (options: CreateAppOptions = {}) => {
  const app = express();
  const repository = options.repository ?? new SqliteStorageRepository();
  const storageBackend = options.storageBackend ?? "sqlite";
  const storageService = new StorageService(repository);
  const storageController = new StorageController(storageService);
  const uploadsDir =
    options.uploadsDir ?? path.resolve(process.cwd(), "uploads");
  const assetService =
    options.assetService ?? new AssetService({ uploadsDir });
  const assetController = new AssetController(assetService);
  const authService = options.authService ?? new AuthService();
  const authController = new AuthController(authService);

  app.use(
    cors({
      origin: serverConfig.corsOrigin,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "60mb" }));
  app.use("/uploads", express.static(uploadsDir));

  // API routes are always registered (no NODE_ENV / feature-flag gate).
  app.use("/api", createHealthRouter(storageBackend));
  app.use("/api/storage", createStorageRouter(storageController));
  app.use("/api/assets", createAssetRouter(assetController));
  app.use("/api/auth", createAuthRouter(authController));

  if (options.serveSpaDir) {
    const spaDir = options.serveSpaDir;
    app.use(express.static(spaDir));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        next();
        return;
      }
      res.sendFile(path.join(spaDir, "index.html"), (err) => {
        if (err) next(err);
      });
    });
  }

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error("[exacty-cms-api]", err);
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "LIMIT_FILE_SIZE"
    ) {
      res.status(400).json({ error: "File too large" });
      return;
    }
    res.status(500).json({ error: "Internal server error" });
  };
  app.use(errorHandler);

  return app;
};
