import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { SqliteStorageRepository } from "./repositories/SqliteStorageRepository.js";

describe("Storage API (Stage 2 — SQLite)", () => {
  const repository = new SqliteStorageRepository();
  const app = createApp({ repository, storageBackend: "sqlite" });
  const testKeys = new Set<string>();

  const track = (key: string) => {
    testKeys.add(key);
    return key;
  };

  beforeEach(async () => {
    for (const key of testKeys) {
      await repository.remove(key);
    }
    testKeys.clear();
  });

  afterAll(async () => {
    for (const key of testKeys) {
      await repository.remove(key);
    }
  });

  it("GET missing key returns value null", async () => {
    const res = await request(app).get("/api/storage/missing-key");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ key: "missing-key", value: null });
  });

  it("POST saves a value and GET retrieves it", async () => {
    const key = track(`test-draft-${Date.now()}`);
    const payload = { hello: "world", n: 1 };
    const post = await request(app)
      .post(`/api/storage/${key}`)
      .send({ value: payload });

    expect(post.status).toBe(200);
    expect(post.body.ok).toBe(true);
    expect(post.body.value).toEqual(payload);

    const get = await request(app).get(`/api/storage/${key}`);
    expect(get.status).toBe(200);
    expect(get.body).toEqual({ key, value: payload });
  });

  it("DELETE removes a value", async () => {
    const key = track(`test-temp-${Date.now()}`);
    await request(app).post(`/api/storage/${key}`).send({ value: { a: 1 } });
    const del = await request(app).delete(`/api/storage/${key}`);
    expect(del.status).toBe(200);
    expect(del.body.ok).toBe(true);

    const get = await request(app).get(`/api/storage/${key}`);
    expect(get.body.value).toBeNull();
  });

  it("GET /api/health reports sqlite storage", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.sqlite).toBe(true);
    expect(res.body.storage).toBe("sqlite");
  });
});
