import { Router } from "express";
import type { StorageController } from "../controllers/storage.controller.js";

export const createStorageRouter = (controller: StorageController) => {
  const router = Router();
  router.get("/:key", controller.get);
  router.post("/:key", controller.set);
  router.delete("/:key", controller.remove);
  return router;
};
