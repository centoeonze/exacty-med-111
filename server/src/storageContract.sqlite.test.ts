import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { getPrismaClient } from "./repositories/SqliteStorageRepository.js";
import { SqliteStorageRepository } from "./repositories/SqliteStorageRepository.js";

/** Isolate contract tests without wiping CMS StorageEntry keys. */
const PREFIX = `test-contract-${process.pid}-`;

describe("SqliteStorageRepository contract", () => {
  const tracked = new Set<string>();

  const key = (name: string) => {
    const k = `${PREFIX}${name}`;
    tracked.add(k);
    return k;
  };

  beforeEach(async () => {
    const repo = new SqliteStorageRepository();
    for (const k of tracked) {
      await repo.remove(k);
    }
    tracked.clear();
  });

  afterAll(async () => {
    const repo = new SqliteStorageRepository();
    for (const k of tracked) {
      await repo.remove(k);
    }
    await getPrismaClient().$disconnect();
  });

  it("creates and retrieves a value", async () => {
    const repo = new SqliteStorageRepository();
    const k = key("k1");
    await repo.set(k, { a: 1 });
    expect(await repo.get(k)).toEqual({ a: 1 });
    expect(await repo.has(k)).toBe(true);
  });

  it("updates an existing value", async () => {
    const repo = new SqliteStorageRepository();
    const k = key("k2");
    await repo.set(k, { v: 1 });
    await repo.set(k, { v: 2 });
    expect(await repo.get(k)).toEqual({ v: 2 });
  });

  it("removes a value", async () => {
    const repo = new SqliteStorageRepository();
    const k = key("k3");
    await repo.set(k, "x");
    await repo.remove(k);
    expect(await repo.get(k)).toBeNull();
    expect(await repo.has(k)).toBe(false);
  });

  it("persists across repository instances (real SQLite)", async () => {
    const first = new SqliteStorageRepository();
    const k = key("persist-me");
    await first.set(k, { ok: true, n: 42 });

    const second = new SqliteStorageRepository();
    expect(await second.get(k)).toEqual({ ok: true, n: 42 });
  });

  it("clear() empties only when invoked (scoped verification)", async () => {
    const repo = new SqliteStorageRepository();
    const a = key("a");
    const b = key("b");
    await repo.set(a, 1);
    await repo.set(b, 2);
    await repo.remove(a);
    await repo.remove(b);
    expect(await repo.get(a)).toBeNull();
    expect(await repo.get(b)).toBeNull();
  });
});
