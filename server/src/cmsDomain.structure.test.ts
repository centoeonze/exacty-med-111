import { afterAll, describe, expect, it } from "vitest";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";
import {
  PrismaAssetRepository,
  PrismaPageRepository,
  PrismaProjectRepository,
  PrismaUserRepository,
  PrismaVersionRepository,
} from "./repositories/prismaCmsRepositories.js";
import { SqliteStorageRepository } from "./repositories/SqliteStorageRepository.js";

describe("CMS domain model structure (Stage 3)", () => {
  const prisma = getPrismaClient();

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("connects to SQLite via Prisma", async () => {
    await prisma.$connect();
    expect(true).toBe(true);
  });

  it("keeps StorageEntry table working", async () => {
    const kv = new SqliteStorageRepository(prisma);
    await kv.set("stage3-probe", { ok: true });
    expect(await kv.get("stage3-probe")).toEqual({ ok: true });
    await kv.remove("stage3-probe");
  });

  it("creates Project → Page → Version → Asset → User", async () => {
    const projects = new PrismaProjectRepository(prisma);
    const pages = new PrismaPageRepository(prisma);
    const versions = new PrismaVersionRepository(prisma);
    const assets = new PrismaAssetRepository(prisma);
    const users = new PrismaUserRepository(prisma);

    const project = await projects.create({
      name: "Exacty Med",
      slug: `exacty-med-stage3-${Date.now()}`,
    });
    expect(project.id).toBeTruthy();

    const page = await pages.create({
      projectId: project.id,
      name: "Home",
      slug: "home",
      content: { pages: [] },
    });
    expect(page.projectId).toBe(project.id);

    const version = await versions.create({
      projectId: project.id,
      pageId: page.id,
      status: "published",
      content: { html: "<main id='hero'></main>", css: "", updatedAt: new Date().toISOString() },
    });
    expect(version.status).toBe("published");

    const asset = await assets.create({
      projectId: project.id,
      type: "pdf",
      name: "catalogo.pdf",
      url: "/uploads/catalogo.pdf",
      storagePath: "uploads/catalogo.pdf",
      mimeType: "application/pdf",
      metadata: { source: "stage3-test" },
    });
    expect(asset.url).toBe("/uploads/catalogo.pdf");
    expect(asset.type).toBe("pdf");

    const user = await users.create({
      email: `stage3-${Date.now()}@exacty.test`,
      username: `stage3_${Date.now()}`,
    });
    expect(user.email).toContain("@exacty.test");

    // cleanup
    await users.delete(user.id);
    await projects.delete(project.id);
  });

  it("lists expected Prisma models on the client", () => {
    expect(prisma.storageEntry).toBeDefined();
    expect(prisma.project).toBeDefined();
    expect(prisma.page).toBeDefined();
    expect(prisma.version).toBeDefined();
    expect(prisma.asset).toBeDefined();
    expect(prisma.user).toBeDefined();
  });
});
