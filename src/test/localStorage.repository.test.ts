/**
 * LocalStorageRepository — no /api calls for draft/publish.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocalStorageRepository } from "@/cms/repositories/LocalStorageRepository";
import { DRAFT_KEY, PUBLISHED_KEY } from "@/cms/repositories/types";

const memory = new Map<string, string>();

beforeEach(() => {
  memory.clear();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => {
      memory.set(k, String(v));
    },
    removeItem: (k: string) => {
      memory.delete(k);
    },
    clear: () => memory.clear(),
    key: () => null,
    get length() {
      return memory.size;
    },
  });
});

describe("LocalStorageRepository save/publish", () => {
  it("saveDraft persists and reloads without fetch", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const repo = new LocalStorageRepository();
    const draft = { pages: [{ id: "1" }] };
    repo.saveDraft(draft);
    expect(JSON.parse(memory.get(DRAFT_KEY)!)).toEqual(draft);
    expect(repo.loadDraft()).toEqual(draft);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("savePublished persists html/css without fetch", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const repo = new LocalStorageRepository();
    const page = repo.savePublished({ html: "<h1>Hi</h1>", css: "h1{}" });
    expect(page.html).toBe("<h1>Hi</h1>");
    expect(page.updatedAt).toBeTruthy();
    expect(JSON.parse(memory.get(PUBLISHED_KEY)!).html).toBe("<h1>Hi</h1>");
    expect(repo.loadPublished()?.html).toBe("<h1>Hi</h1>");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
