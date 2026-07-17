import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";
import { SqliteStorageRepository } from "./repositories/SqliteStorageRepository.js";
import {
  DRAFT_KEY,
  LegacyAssetMigrationService,
  MEDIA_ASSETS_KEY,
  PUBLISHED_KEY,
} from "./services/LegacyAssetMigrationService.js";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

describe("LegacyAssetMigrationService (Stage 9C)", () => {
  const prisma = getPrismaClient();
  const kv = new SqliteStorageRepository(prisma);
  const uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "cms-legacy-assets-"));

  let snapshot: {
    draft: unknown;
    published: unknown;
    media: unknown;
  };

  beforeAll(async () => {
    snapshot = {
      draft: await kv.get(DRAFT_KEY),
      published: await kv.get(PUBLISHED_KEY),
      media: await kv.get(MEDIA_ASSETS_KEY),
    };
  });

  afterAll(async () => {
    if (snapshot.draft == null) await kv.remove(DRAFT_KEY);
    else await kv.set(DRAFT_KEY, snapshot.draft);
    if (snapshot.published == null) await kv.remove(PUBLISHED_KEY);
    else await kv.set(PUBLISHED_KEY, snapshot.published);
    if (snapshot.media == null) await kv.remove(MEDIA_ASSETS_KEY);
    else await kv.set(MEDIA_ASSETS_KEY, snapshot.media);
    await prisma.$disconnect();
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  });

  it("audits StorageEntry data URLs", async () => {
    await kv.set(MEDIA_ASSETS_KEY, [
      { type: "image", name: "dot.png", src: TINY_PNG },
    ]);
    await kv.set(DRAFT_KEY, {
      pages: [{ frames: [{ component: { type: "image", src: TINY_PNG } }] }],
    });
    await kv.set(PUBLISHED_KEY, {
      html: `<img src="${TINY_PNG}" />`,
      css: "",
      updatedAt: "2026-07-17T00:00:00.000Z",
    });

    const service = new LegacyAssetMigrationService({ prisma, uploadsDir });
    const audit = await service.audit();

    expect(audit.dataUrlCount).toBeGreaterThanOrEqual(3);
    expect(audit.byKey[MEDIA_ASSETS_KEY]?.count).toBeGreaterThanOrEqual(1);
    expect(audit.byKey[DRAFT_KEY]?.count).toBeGreaterThanOrEqual(1);
    expect(audit.byMime["image/png"]).toBeGreaterThanOrEqual(1);
    expect(audit.totalApproxBytes).toBeGreaterThan(0);
  });

  it("converts base64 to Asset + rewrites references (execute)", async () => {
    await kv.set(MEDIA_ASSETS_KEY, [
      { type: "image", name: "dot.png", src: TINY_PNG },
    ]);
    await kv.set(DRAFT_KEY, {
      pages: [{ frames: [{ component: { type: "image", src: TINY_PNG } }] }],
    });
    await kv.set(PUBLISHED_KEY, {
      html: `<img src="${TINY_PNG}" />`,
      css: "",
      updatedAt: "2026-07-17T00:00:00.000Z",
    });

    const service = new LegacyAssetMigrationService({ prisma, uploadsDir });
    const result = await service.migrate({ dryRun: false });

    expect(result.errors).toEqual([]);
    expect(result.converted).toBeGreaterThanOrEqual(1);
    expect(result.assetsCreated.length).toBeGreaterThanOrEqual(1);
    expect(result.referencesUpdated).toBeGreaterThanOrEqual(3);
    expect(result.remainingDataUrls).toBe(0);
    expect(result.ok).toBe(true);

    const asset = await prisma.asset.findUnique({
      where: { id: result.assetsCreated[0] },
    });
    expect(asset).toBeTruthy();
    expect(asset!.url.startsWith("/uploads/")).toBe(true);
    expect(asset!.url.includes("data:")).toBe(false);
    expect(asset!.storagePath).toBeTruthy();
    expect(asset!.mimeType).toBe("image/png");
    expect(asset!.sizeBytes).toBeGreaterThan(0);
    expect(
      fs.existsSync(path.join(uploadsDir, path.basename(asset!.storagePath!))),
    ).toBe(true);

    const media = await kv.get<Array<{ src: string; assetId?: string }>>(
      MEDIA_ASSETS_KEY,
    );
    expect(media?.[0]?.src.startsWith("/uploads/")).toBe(true);
    expect(media?.[0]?.src.includes("data:")).toBe(false);
    expect(media?.[0]?.assetId).toBe(asset!.id);

    const draft = await kv.get<{
      pages: Array<{ frames: Array<{ component: { src: string } }> }>;
    }>(DRAFT_KEY);
    expect(draft?.pages[0].frames[0].component.src).toBe(asset!.url);

    const published = await kv.get<{ html: string }>(PUBLISHED_KEY);
    expect(published?.html.includes("data:")).toBe(false);
    expect(published?.html.includes(asset!.url)).toBe(true);
  });

  it("report mode does not mutate StorageEntry", async () => {
    await kv.set(MEDIA_ASSETS_KEY, [
      { type: "image", name: "keep.png", src: TINY_PNG },
    ]);

    const service = new LegacyAssetMigrationService({ prisma, uploadsDir });
    const before = await kv.get(MEDIA_ASSETS_KEY);
    const result = await service.migrate({ dryRun: true });

    expect(result.mode).toBe("report");
    expect(result.converted).toBeGreaterThanOrEqual(1);
    expect(await kv.get(MEDIA_ASSETS_KEY)).toEqual(before);
  });
});
