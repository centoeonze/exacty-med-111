import { afterAll, describe, expect, it } from "vitest";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";
import { PrismaUserRepository } from "./repositories/prismaCmsRepositories.js";

describe("User repository (Stage 8 — persistent auth prep)", () => {
  const prisma = getPrismaClient();
  const users = new PrismaUserRepository(prisma);

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates, finds by email, updates, and persists role/passwordHash", async () => {
    const email = `stage8-${Date.now()}@exacty.test`;
    const created = await users.create({
      email,
      username: `u${Date.now()}`,
      passwordHash: "hash-placeholder",
      role: "admin",
    });

    expect(created.id).toBeTruthy();
    expect(created.email).toBe(email);
    expect(created.passwordHash).toBe("hash-placeholder");
    expect(created.role).toBe("admin");
    expect(created.updatedAt).toBeInstanceOf(Date);

    const found = await users.findByEmail(email);
    expect(found?.id).toBe(created.id);
    expect(found?.role).toBe("admin");

    const updated = await users.update(created.id, {
      passwordHash: "hash-rotated",
      role: "editor",
    });
    expect(updated.passwordHash).toBe("hash-rotated");
    expect(updated.role).toBe("editor");

    const again = await users.findByEmail(email);
    expect(again?.passwordHash).toBe("hash-rotated");
    expect(again?.role).toBe("editor");
  });

  it("defaults role to editor when omitted", async () => {
    const email = `stage8-default-${Date.now()}@exacty.test`;
    const created = await users.create({ email });
    expect(created.role).toBe("editor");
  });
});
