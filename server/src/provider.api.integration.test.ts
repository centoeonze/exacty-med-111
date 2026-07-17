import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { SqliteStorageRepository } from "./repositories/SqliteStorageRepository.js";
import { SeedKvFromDomainService } from "./services/SeedKvFromDomainService.js";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";
import {
  PrismaPageRepository,
  PrismaProjectRepository,
  PrismaVersionRepository,
} from "./repositories/prismaCmsRepositories.js";

const CMS_KEYS = [
  "exacty-cms-draft",
  "exacty-cms-published",
  "exacty-cms-media-assets",
] as const;

/**
 * Stage 5 — API provider integration: get / set / remove / persist via Express + SQLite.
 * Does not wipe unrelated StorageEntry rows (preserves CMS data for Stage 9C+).
 */
describe("provider.api.integration (Stage 5)", () => {
  const repository = new SqliteStorageRepository();
  const app = createApp({ repository, storageBackend: "sqlite" });
  let cmsSnapshot: Record<string, unknown | null> = {};

  beforeAll(async () => {
    for (const key of CMS_KEYS) {
      cmsSnapshot[key] = await repository.get(key);
    }
  });

  beforeEach(async () => {
    // Isolate only CMS keys used by these tests — never repository.clear().
    for (const key of CMS_KEYS) {
      await repository.remove(key);
    }
  });

  afterAll(async () => {
    for (const key of CMS_KEYS) {
      const value = cmsSnapshot[key];
      if (value == null) await repository.remove(key);
      else await repository.set(key, value);
    }
  });

  it("get / set / remove / persist across repository instances", async () => {
    const key = "exacty-cms-draft";
    const value = { pages: [{ name: "Home" }], stage: 5 };

    const missing = await request(app).get(`/api/storage/${key}`);
    expect(missing.status).toBe(200);
    expect(missing.body.value).toBeNull();

    const set = await request(app).post(`/api/storage/${key}`).send({ value });
    expect(set.status).toBe(200);
    expect(set.body.value).toEqual(value);

    const get = await request(app).get(`/api/storage/${key}`);
    expect(get.body.value).toEqual(value);

    const other = new SqliteStorageRepository();
    expect(await other.get(key)).toEqual(value);

    const del = await request(app).delete(`/api/storage/${key}`);
    expect(del.status).toBe(200);
    expect((await request(app).get(`/api/storage/${key}`)).body.value).toBeNull();
  });

  it("seeds KV from domain so API can serve migrated draft/published", async () => {
    const prisma = getPrismaClient();
    const projects = new PrismaProjectRepository(prisma);
    const pages = new PrismaPageRepository(prisma);
    const versions = new PrismaVersionRepository(prisma);

    const project = await projects.create({
      name: "Stage5 Seed",
      slug: `cms-migrated-stage5-${Date.now()}`,
    });
    const draft = { pages: [{ frames: [{ component: { type: "wrapper" } }] }] };
    const page = await pages.create({
      projectId: project.id,
      name: "Home",
      slug: "home",
      content: draft,
    });
    await versions.create({
      projectId: project.id,
      pageId: page.id,
      status: "draft",
      content: draft,
    });
    await versions.create({
      projectId: project.id,
      pageId: page.id,
      status: "published",
      content: {
        html: "<div>published</div>",
        css: "",
        updatedAt: "2026-07-17T00:00:00.000Z",
      },
    });

    const seed = await new SeedKvFromDomainService(prisma).seedProject(project.id);
    expect(seed.ok).toBe(true);
    expect(seed.draftSeeded).toBe(true);
    expect(seed.publishedSeeded).toBe(true);

    const draftRes = await request(app).get("/api/storage/exacty-cms-draft");
    expect(draftRes.body.value).toEqual(draft);

    const pubRes = await request(app).get("/api/storage/exacty-cms-published");
    expect(pubRes.body.value).toMatchObject({ html: "<div>published</div>" });
  });
});
