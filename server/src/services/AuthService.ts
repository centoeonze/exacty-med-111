import bcrypt from "bcryptjs";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../repositories/SqliteStorageRepository.js";
import { PrismaUserRepository } from "../repositories/prismaCmsRepositories.js";
import type { UserRecord } from "../repositories/UserRepository.js";

const COOKIE_NAME = "exacty_cms_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const BCRYPT_ROUNDS = 10;

export type AuthPublicUser = {
  id: string;
  email: string;
  username: string | null;
  role: string;
};

export type LoginResult =
  | { ok: true; user: AuthPublicUser; cookieValue: string }
  | { ok: false; status: number; error: string };

const safeEqual = (a: string, b: string) => {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) {
    timingSafeEqual(ba, ba);
    return false;
  }
  return timingSafeEqual(ba, bb);
};

export class AuthService {
  private readonly users: PrismaUserRepository;
  private readonly sessionSecret: string;

  constructor(
    private readonly prisma: PrismaClient = getPrismaClient(),
    sessionSecret = process.env.CMS_SESSION_SECRET || process.env.CMS_PASSWORD || "exacty-cms-dev-secret",
  ) {
    this.users = new PrismaUserRepository(prisma);
    this.sessionSecret = sessionSecret;
  }

  static cookieName() {
    return COOKIE_NAME;
  }

  static sessionMaxAgeSec() {
    return Math.floor(SESSION_TTL_MS / 1000);
  }

  toPublicUser(user: UserRecord): AuthPublicUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  createSessionCookie(userId: string): string {
    const exp = Date.now() + SESSION_TTL_MS;
    const sig = createHmac("sha256", this.sessionSecret)
      .update(`exacty-cms-api-session:${userId}:${exp}`)
      .digest("hex");
    return `${userId}.${exp}.${sig}`;
  }

  verifySessionCookie(value: string | undefined): string | null {
    if (!value) return null;
    const [userId, expRaw, sig] = value.split(".");
    const exp = Number(expRaw);
    if (!userId || !expRaw || !sig || !Number.isFinite(exp) || Date.now() > exp) {
      return null;
    }
    const expected = createHmac("sha256", this.sessionSecret)
      .update(`exacty-cms-api-session:${userId}:${exp}`)
      .digest("hex");
    if (!safeEqual(sig, expected)) return null;
    return userId;
  }

  async login(usernameOrEmail: string, password: string): Promise<LoginResult> {
    const identity = String(usernameOrEmail || "").trim();
    const pass = String(password || "");
    if (!identity || !pass) {
      return { ok: false, status: 400, error: "Usuário e senha são obrigatórios." };
    }

    const byEmail = await this.users.findByEmail(identity);
    const byUsername = byEmail
      ? null
      : await this.prisma.user.findFirst({ where: { username: identity } });
    const user = byEmail ?? byUsername;

    if (!user?.passwordHash) {
      await bcrypt.hash(pass, BCRYPT_ROUNDS); // timing pad
      return { ok: false, status: 401, error: "Usuário ou senha incorretos." };
    }

    const match = await bcrypt.compare(pass, user.passwordHash);
    if (!match) {
      return { ok: false, status: 401, error: "Usuário ou senha incorretos." };
    }

    return {
      ok: true,
      user: this.toPublicUser(user),
      cookieValue: this.createSessionCookie(user.id),
    };
  }

  async me(cookieValue: string | undefined): Promise<AuthPublicUser | null> {
    const userId = this.verifySessionCookie(cookieValue);
    if (!userId) return null;
    const user = await this.users.findById(userId);
    return user ? this.toPublicUser(user) : null;
  }

  /**
   * Ensures CMS admin exists from CMS_USERNAME / CMS_PASSWORD.
   * Syncs password hash on every boot so EasyPanel env credentials always work.
   */
  async ensureBootstrapUserFromEnv(): Promise<{ created: boolean; email: string } | null> {
    const username = String(process.env.CMS_USERNAME || "").trim();
    const password = String(process.env.CMS_PASSWORD || "");
    if (!username || !password) {
      console.warn(
        "[exacty-cms-api] bootstrap skipped: set CMS_USERNAME and CMS_PASSWORD (runtime env, not only build-arg)",
      );
      return null;
    }

    const email = username.includes("@")
      ? username
      : `${username.replace(/[^\w.-]+/g, "_")}@exacty.local`;

    const existing =
      (await this.users.findByEmail(email)) ||
      (await this.prisma.user.findFirst({ where: { username } }));

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, username, email },
      });
      return { created: false, email: existing.email };
    }

    await this.users.create({
      email,
      username,
      passwordHash,
      role: "admin",
    });
    return { created: true, email };
  }
}
