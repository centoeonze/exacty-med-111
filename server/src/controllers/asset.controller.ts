import type { Request, Response, NextFunction } from "express";
import { AssetService, AssetServiceError } from "../services/AssetService.js";

export class AssetController {
  constructor(private readonly assets: AssetService) {}

  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "Missing file field (multipart field name: file)" });
        return;
      }
      const projectId =
        typeof req.body?.projectId === "string" ? req.body.projectId : undefined;
      const type = typeof req.body?.type === "string" ? req.body.type : undefined;

      const asset = await this.assets.upload({
        buffer: file.buffer,
        originalName: file.originalname || "upload",
        mimeType: file.mimetype || "application/octet-stream",
        projectId,
        type,
      });

      res.status(201).json({ ok: true, asset });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await this.assets.getById(String(req.params.id));
      res.status(200).json({ ok: true, asset });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.assets.delete(String(req.params.id));
      res.status(200).json({ ok: true });
    } catch (error) {
      this.handleError(error, res, next);
    }
  };

  private handleError(error: unknown, res: Response, next: NextFunction) {
    if (error instanceof AssetServiceError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
}
