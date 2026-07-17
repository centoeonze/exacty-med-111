import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";
import { AssetService } from "./services/AssetService.js";

describe("AssetService + /api/assets (Stage 8)", () => {
  const uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "cms-assets-"));
  const assetService = new AssetService({ uploadsDir });
  const app = createApp({ uploadsDir, assetService, storageBackend: "sqlite" });
  const prisma = getPrismaClient();

  // Tiny valid PNG (1x1)
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  afterAll(async () => {
    await prisma.$disconnect();
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  });

  beforeAll(async () => {
    await prisma.$connect();
  });

  it("uploads a file, creates Prisma Asset, and serves metadata", async () => {
    const res = await request(app)
      .post("/api/assets/upload")
      .attach("file", png, { filename: "dot.png", contentType: "image/png" });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.asset.url).toMatch(/^\/uploads\//);
    expect(res.body.asset.storagePath).toBeTruthy();
    expect(res.body.asset.mimeType).toBe("image/png");
    expect(res.body.asset.sizeBytes).toBe(png.length);
    expect(String(res.body.asset.url)).not.toContain("data:");

    const abs = path.join(uploadsDir, path.basename(res.body.asset.storagePath));
    expect(fs.existsSync(abs)).toBe(true);

    const get = await request(app).get(`/api/assets/${res.body.asset.id}`);
    expect(get.status).toBe(200);
    expect(get.body.asset.id).toBe(res.body.asset.id);

    const fileRes = await request(app).get(res.body.asset.url);
    expect(fileRes.status).toBe(200);
  });

  it("rejects unsupported mime types", async () => {
    const res = await request(app)
      .post("/api/assets/upload")
      .attach("file", Buffer.from("hello"), {
        filename: "note.txt",
        contentType: "text/plain",
      });
    expect(res.status).toBe(400);
  });

  it("deletes Asset row and filesystem file", async () => {
    const created = await request(app)
      .post("/api/assets/upload")
      .attach("file", png, { filename: "del.png", contentType: "image/png" });

    const id = created.body.asset.id as string;
    const storagePath = created.body.asset.storagePath as string;
    const abs = path.join(uploadsDir, path.basename(storagePath));
    expect(fs.existsSync(abs)).toBe(true);

    const del = await request(app).delete(`/api/assets/${id}`);
    expect(del.status).toBe(200);
    expect(fs.existsSync(abs)).toBe(false);

    const missing = await request(app).get(`/api/assets/${id}`);
    expect(missing.status).toBe(404);
  });

  it("rejects embedded data/blob URLs via service guard", () => {
    expect(() =>
      assetService.assertNotEmbeddedPayload("data:image/png;base64,xxx"),
    ).toThrow(/Base64/);
  });
});
