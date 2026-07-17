import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";
import { LocalStorageMigrationService } from "./services/LocalStorageMigrationService.js";
import { StorageComparisonService } from "./services/StorageComparisonService.js";

describe("LocalStorageMigrationService (Stage 4)", () => {
  const prisma = getPrismaClient();
  const uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "cms-migrate-"));

  afterAll(async () => {
    await prisma.$disconnect();
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  });

  it("creates Page from draft and Version from published", async () => {
    const service = new LocalStorageMigrationService({
      prisma,
      uploadsDir,
      projectSlug: `migrate-draft-${Date.now()}`,
    });

    const draft = { pages: [{ frames: [{ component: { type: "wrapper" } }] }] };
    const published = {
      html: "<div>Hello</div>",
      css: "div{color:red}",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    const report = await service.migrate({ draft, published, mediaAssets: [] });

    expect(report.pagesCreated).toBe(1);
    expect(report.versionsCreated).toBe(2);
    expect(report.projectId).toBeTruthy();

    const page = await prisma.page.findFirst({
      where: { projectId: report.projectId! },
    });
    expect(page?.content).toEqual(draft);

    const versions = await prisma.version.findMany({
      where: { projectId: report.projectId! },
      orderBy: { createdAt: "asc" },
    });
    expect(versions.map((v) => v.status)).toEqual(["draft", "published"]);
    expect(versions[1].content).toMatchObject({ html: published.html });
  });

  it("creates Asset records and extracts base64 to storagePath", async () => {
    const service = new LocalStorageMigrationService({
      prisma,
      uploadsDir,
      projectSlug: `migrate-assets-${Date.now()}`,
    });

    const tinyPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    const report = await service.migrate({
      draft: { ok: true },
      mediaAssets: [
        { type: "image", name: "dot.png", src: tinyPng },
        { type: "pdf", name: "remote.pdf", src: "https://example.com/a.pdf" },
      ],
    });

    expect(report.assetsCreated).toBe(2);
    expect(report.assetsSkippedBase64Extracted).toBe(1);

    const assets = await prisma.asset.findMany({
      where: { projectId: report.projectId! },
      orderBy: { createdAt: "asc" },
    });
    expect(assets[0].storagePath).toBeTruthy();
    expect(assets[0].url.startsWith("/uploads/")).toBe(true);
    expect(assets[0].url.includes("data:")).toBe(false);
    expect(fs.existsSync(path.join(uploadsDir, path.basename(assets[0].storagePath!)))).toBe(
      true,
    );
    expect(assets[1].url).toBe("https://example.com/a.pdf");
    expect(assets[1].storagePath).toBeNull();
  });

  it("does not throw on invalid JSON payloads", async () => {
    const service = new LocalStorageMigrationService({
      prisma,
      uploadsDir,
      projectSlug: `migrate-invalid-${Date.now()}`,
    });

    const report = await service.migrate({
      draft: "not-an-object",
      published: { broken: true },
      mediaAssets: "not-an-array",
    });

    expect(report.projectId).toBeTruthy();
    expect(report.pagesCreated).toBe(1);
    expect(report.errors.length).toBeGreaterThan(0);
    expect(report.versionsCreated).toBe(0);
  });
});

describe("StorageComparisonService (Stage 4)", () => {
  it("reports equality and divergences", () => {
    const cmp = new StorageComparisonService();
    const equal = cmp.compare(
      { draft: { a: 1 }, published: null, mediaAssets: [] },
      { draft: { a: 1 }, published: null, mediaAssets: [] },
    );
    expect(equal.equal).toBe(true);

    const diverged = cmp.compare(
      { draft: { a: 1 } },
      { draft: { a: 2 } },
    );
    expect(diverged.equal).toBe(false);
    expect(diverged.diffs[0].domain).toBe("draft");
  });
});
