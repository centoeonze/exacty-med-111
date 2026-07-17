import { Router } from "express";

export const createHealthRouter = (storageBackend: "sqlite" | "memory" = "sqlite") => {
  const router = Router();
  router.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "exacty-cms-api",
      storage: storageBackend,
      sqlite: storageBackend === "sqlite",
    });
  });
  return router;
};
