import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { AuthService } from "./services/AuthService.js";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";
import { PrismaUserRepository } from "./repositories/prismaCmsRepositories.js";
import bcrypt from "bcrypt";

describe("Auth API (Stage 9A)", () => {
  const prisma = getPrismaClient();
  const authService = new AuthService(prisma, "test-session-secret");
  const app = createApp({ authService, storageBackend: "sqlite" });
  const users = new PrismaUserRepository(prisma);

  const email = `auth9a-${Date.now()}@exacty.test`;
  const username = `auth9a_${Date.now()}`;
  const password = "CorrectHorseBattery!";

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(password, 10);
    await users.create({
      email,
      username,
      passwordHash,
      role: "admin",
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects invalid login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ username, password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body.ok).toBe(false);
  });

  it("logs in with valid credentials and persists session cookie", async () => {
    const agent = request.agent(app);
    const login = await agent
      .post("/api/auth/login")
      .send({ username, password });
    expect(login.status).toBe(200);
    expect(login.body.ok).toBe(true);
    expect(login.body.user.email).toBe(email);
    expect(login.headers["set-cookie"]).toBeTruthy();

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.authenticated).toBe(true);
    expect(me.body.user.username).toBe(username);
  });

  it("logs out and clears session", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ username, password });
    const logout = await agent.post("/api/auth/logout");
    expect(logout.status).toBe(200);

    const me = await agent.get("/api/auth/me");
    expect(me.body.authenticated).toBe(false);
  });

  it("never stores plain password on create", async () => {
    const row = await users.findByEmail(email);
    expect(row?.passwordHash).toBeTruthy();
    expect(row?.passwordHash).not.toBe(password);
    expect(row?.passwordHash?.startsWith("$2")).toBe(true);
  });
});
