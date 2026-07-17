import type { Request, Response, NextFunction } from "express";
import type { StorageService } from "../services/storage.service.js";

export class StorageController {
  constructor(private readonly storage: StorageService) {}

  get = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = String(req.params.key || "");
      const value = await this.storage.get(key);
      res.json({ key, value });
    } catch (error) {
      next(error);
    }
  };

  set = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = String(req.params.key || "");
      const body = req.body as { value?: unknown };
      if (!body || !("value" in body)) {
        res.status(400).json({ error: "Body must include a `value` field." });
        return;
      }
      await this.storage.set(key, body.value);
      res.json({ key, value: body.value, ok: true });
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = String(req.params.key || "");
      await this.storage.remove(key);
      res.json({ key, ok: true });
    } catch (error) {
      next(error);
    }
  };
}
