/**
 * Server-side CMS auth for Vite (dev + preview).
 * Credentials stay in process.env (CMS_USERNAME / CMS_PASSWORD) — never bundled to the client.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Plugin, Connect } from "vite";
import { loadEnv } from "vite";

const COOKIE_NAME = "exacty_cms_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const API_PREFIX = "/api/cms-auth";

type EnvCreds = { username: string; password: string };

const safeEqual = (a: string, b: string) => {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) {
    timingSafeEqual(ba, ba);
    return false;
  }
  return timingSafeEqual(ba, bb);
};

const readBody = (req: IncomingMessage) =>
  new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

const parseCookies = (header: string | undefined) => {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    out[key] = decodeURIComponent(value);
  }
  return out;
};

const signSession = (password: string, username: string, exp: number) =>
  createHmac("sha256", password).update(`exacty-cms-session:${username}:${exp}`).digest("hex");

const createSessionValue = (creds: EnvCreds) => {
  const exp = Date.now() + SESSION_TTL_MS;
  const sig = signSession(creds.password, creds.username, exp);
  return `${exp}.${sig}`;
};

const verifySessionValue = (value: string | undefined, creds: EnvCreds) => {
  if (!value || !creds.username || !creds.password) return false;
  const [expRaw, sig] = value.split(".");
  const exp = Number(expRaw);
  if (!expRaw || !sig || !Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = signSession(creds.password, creds.username, exp);
  return safeEqual(sig, expected);
};

const sendJson = (res: ServerResponse, status: number, body: Record<string, unknown>) => {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(payload);
};

const setSessionCookie = (res: ServerResponse, value: string) => {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
  );
};

const clearSessionCookie = (res: ServerResponse) => {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
};

const getCreds = (mode: string, envDir: string): EnvCreds => {
  const env = loadEnv(mode, envDir, "");
  return {
    username: String(env.CMS_USERNAME ?? process.env.CMS_USERNAME ?? "").trim(),
    password: String(env.CMS_PASSWORD ?? process.env.CMS_PASSWORD ?? ""),
  };
};

const createAuthMiddleware = (mode: string, envDir: string): Connect.NextHandleFunction => {
  return async (req, res, next) => {
    const url = req.url || "";
    if (!url.startsWith(API_PREFIX)) {
      next();
      return;
    }

    const path = url.split("?")[0];
    const creds = getCreds(mode, envDir);

    try {
      if (path === `${API_PREFIX}/session` && req.method === "GET") {
        const cookies = parseCookies(req.headers.cookie);
        const authenticated = verifySessionValue(cookies[COOKIE_NAME], creds);
        sendJson(res, 200, { authenticated });
        return;
      }

      if (path === `${API_PREFIX}/logout` && req.method === "POST") {
        clearSessionCookie(res);
        sendJson(res, 200, { ok: true });
        return;
      }

      if (path === `${API_PREFIX}/login` && req.method === "POST") {
        if (!creds.username || !creds.password) {
          sendJson(res, 503, {
            ok: false,
            error: "CMS não configurado. Defina CMS_USERNAME e CMS_PASSWORD no arquivo .env.",
          });
          return;
        }

        const raw = await readBody(req);
        let body: { username?: string; password?: string } = {};
        try {
          body = JSON.parse(raw || "{}") as { username?: string; password?: string };
        } catch {
          sendJson(res, 400, { ok: false, error: "Requisição inválida." });
          return;
        }

        const username = String(body.username ?? "");
        const password = String(body.password ?? "");
        const userOk = safeEqual(username, creds.username);
        const passOk = safeEqual(password, creds.password);

        if (!userOk || !passOk) {
          sendJson(res, 401, { ok: false, error: "Usuário ou senha incorretos." });
          return;
        }

        setSessionCookie(res, createSessionValue(creds));
        sendJson(res, 200, { ok: true });
        return;
      }

      sendJson(res, 404, { ok: false, error: "Not found" });
    } catch {
      sendJson(res, 500, { ok: false, error: "Erro interno de autenticação." });
    }
  };
};

export const cmsAuthPlugin = (): Plugin => ({
  name: "exacty-cms-auth",
  configureServer(server) {
    const envDir = server.config.envDir || process.cwd();
    server.middlewares.use(createAuthMiddleware(server.config.mode, envDir));
  },
  configurePreviewServer(server) {
    const envDir = server.config.envDir || process.cwd();
    server.middlewares.use(createAuthMiddleware("production", envDir));
  },
});
