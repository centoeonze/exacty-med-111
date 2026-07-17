import { Router } from "express";
import type { AuthController } from "../controllers/auth.controller.js";

export const createAuthRouter = (controller: AuthController) => {
  const router = Router();
  router.post("/login", controller.login);
  router.post("/logout", controller.logout);
  router.get("/me", controller.me);
  return router;
};
