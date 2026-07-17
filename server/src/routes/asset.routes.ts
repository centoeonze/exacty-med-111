import { Router } from "express";
import multer from "multer";
import type { AssetController } from "../controllers/asset.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

export const createAssetRouter = (controller: AssetController) => {
  const router = Router();
  router.post("/upload", upload.single("file"), controller.upload);
  router.get("/:id", controller.getById);
  router.delete("/:id", controller.remove);
  return router;
};
