import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService.js";

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  // HTTPS behind EasyPanel / Hostinger reverse-proxy
  secure: process.env.NODE_ENV === "production",
  maxAge: AuthService.sessionMaxAgeSec() * 1000,
});

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username = String(req.body?.username ?? req.body?.email ?? "");
      const password = String(req.body?.password ?? "");
      const result = await this.auth.login(username, password);
      if (!result.ok) {
        res.status(result.status).json({ ok: false, error: result.error });
        return;
      }
      res.cookie(AuthService.cookieName(), result.cookieValue, cookieOptions());
      res.status(200).json({ ok: true, user: result.user });
    } catch (error) {
      next(error);
    }
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie(AuthService.cookieName(), {
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ ok: true });
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req.cookies?.[AuthService.cookieName()] as string | undefined;
      const user = await this.auth.me(raw);
      if (!user) {
        res.status(200).json({ authenticated: false });
        return;
      }
      res.status(200).json({ authenticated: true, user });
    } catch (error) {
      next(error);
    }
  };
}
