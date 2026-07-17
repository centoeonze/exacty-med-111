/**
 * IStorageRepository contract suite.
 * Depends only on the interface — any future ApiStorageRepository can plug in
 * by providing a factory without changing these assertions.
 */
import { beforeEach, describe, expect, it } from "vitest";
import type { IStorageRepository } from "@/cms/repositories/IStorageRepository";

export type StorageRepositoryFactory = () => IStorageRepository;

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, String(value));
    },
  };
};

export const runIStorageRepositoryContract = (
  createRepository: StorageRepositoryFactory,
  options?: { label?: string },
) => {
  const label = options?.label ?? "IStorageRepository contract";

  describe(label, () => {
    let repository: IStorageRepository;

    beforeEach(() => {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: createMemoryStorage(),
      });
      repository = createRepository();
    });

    it("saveDraft() + loadDraft() round-trip", () => {
      const draft = {
        assets: [],
        styles: [],
        pages: [{ frames: [{ component: { type: "wrapper", components: [] } }] }],
      };

      repository.saveDraft(draft);
      expect(repository.loadDraft()).toEqual(draft);
    });

    it("loadDraft() returns null when empty", () => {
      expect(repository.loadDraft()).toBeNull();
    });

    it("clearDraft() removes the draft", () => {
      repository.saveDraft({ pages: [] });
      repository.clearDraft();
      expect(repository.loadDraft()).toBeNull();
    });

    it("savePublished() + loadPublished() round-trip with updatedAt", () => {
      const published = repository.savePublished({
        html: "<main id='hero'>Home</main>",
        css: "main{display:block}",
      });

      expect(published.html).toBe("<main id='hero'>Home</main>");
      expect(published.css).toBe("main{display:block}");
      expect(published.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(repository.loadPublished()).toEqual(published);
    });

    it("loadPublished() returns null when empty or without html", () => {
      expect(repository.loadPublished()).toBeNull();
    });

    it("clearPublished() removes the published page", () => {
      repository.savePublished({ html: "<div>x</div>", css: "" });
      repository.clearPublished();
      expect(repository.loadPublished()).toBeNull();
    });

    it("saveMediaAssets() + loadMediaAssets() round-trip", () => {
      const assets = [
        { type: "pdf", src: "data:application/pdf;base64,QQ==", name: "a.pdf" },
        { type: "image", src: "data:image/png;base64,QQ==", name: "b.png" },
      ];

      repository.saveMediaAssets(assets);
      expect(repository.loadMediaAssets()).toEqual(assets);
    });

    it("loadMediaAssets() returns [] when empty", () => {
      expect(repository.loadMediaAssets()).toEqual([]);
    });

    it("saveMediaAssets([]) clears the catalog to an empty list", () => {
      repository.saveMediaAssets([{ type: "pdf", src: "x", name: "x.pdf" }]);
      repository.saveMediaAssets([]);
      expect(repository.loadMediaAssets()).toEqual([]);
    });
  });
};
