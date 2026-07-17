/**
 * Draft / Publish domain: Save writes Draft only; Publish promotes Draft → Published.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  computeContentChecksum,
  loadDraftSnapshot,
  publishLatestDraft,
  saveDraftFromEditor,
  validateDraftSnapshot,
} from "@/cms/draftPublish";
import { getStorageRepository } from "@/cms/repositories";
import {
  DRAFT_KEY,
  DRAFT_SNAPSHOT_KIND,
  PUBLISHED_KEY,
  PUBLISHED_SNAPSHOT_KIND,
} from "@/cms/repositories/types";

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

const sampleHtml =
  '<main id="hero" class="exacty-page-shell"><h1>Exacty</h1><p>Conteúdo de teste do CMS para validação de rascunho.</p></main>';
const sampleCss = "main{display:block}";
const sampleProject = {
  pages: [
    {
      frames: [
        {
          component: {
            type: "wrapper",
            components: [{ type: "text", content: "Exacty" }],
          },
        },
      ],
    },
  ],
  assets: [],
  styles: [],
};

describe("saveDraftFromEditor", () => {
  it("persists a versioned Draft and never writes Published", () => {
    const draft = saveDraftFromEditor({
      project: sampleProject,
      html: sampleHtml,
      css: sampleCss,
    });

    expect(draft.kind).toBe(DRAFT_SNAPSHOT_KIND);
    expect(draft.versionId).toBeTruthy();
    expect(draft.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(draft.checksum).toBe(
      computeContentChecksum(sampleProject, sampleHtml, sampleCss),
    );
    expect(JSON.parse(memory.get(DRAFT_KEY)!).versionId).toBe(draft.versionId);
    expect(memory.get(PUBLISHED_KEY)).toBeUndefined();
    expect(getStorageRepository().loadPublished()).toBeNull();
  });

  it("rejects empty HTML", () => {
    expect(() =>
      saveDraftFromEditor({ project: sampleProject, html: "   ", css: sampleCss }),
    ).toThrow(/HTML vazio/);
  });
});

describe("publishLatestDraft", () => {
  it("fails when there is no versioned draft", () => {
    expect(() => publishLatestDraft()).toThrow(/Salvar antes de Publicar/);
  });

  it("fails for legacy raw project drafts (must Save again)", () => {
    getStorageRepository().saveDraft(sampleProject);
    expect(loadDraftSnapshot()).toBeNull();
    expect(() => publishLatestDraft()).toThrow(/Salvar antes de Publicar/);
  });

  it("promotes Draft → Published with the same versionId and checksum", () => {
    const draft = saveDraftFromEditor({
      project: sampleProject,
      html: sampleHtml,
      css: sampleCss,
    });

    const published = publishLatestDraft();

    expect(published.kind).toBe(PUBLISHED_SNAPSHOT_KIND);
    expect(published.versionId).toBe(draft.versionId);
    expect(published.checksum).toBe(draft.checksum);
    expect(published.html).toBe(draft.html);
    expect(published.css).toBe(draft.css);
    expect(published.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    expect(loadDraftSnapshot()?.versionId).toBe(draft.versionId);
  });

  it("does not overwrite Published when checksum is corrupted", () => {
    const draft = saveDraftFromEditor({
      project: sampleProject,
      html: sampleHtml,
      css: sampleCss,
    });
    const first = publishLatestDraft();

    getStorageRepository().saveDraft({ ...draft, checksum: "tampered" });

    expect(() => publishLatestDraft()).toThrow(/checksum/);
    expect(getStorageRepository().loadPublished()?.versionId).toBe(first.versionId);
    expect(getStorageRepository().loadPublished()?.html).toBe(first.html);
  });

  it("Save then edit then Save creates a new Draft version; Publish uses the latest only", () => {
    const first = saveDraftFromEditor({
      project: sampleProject,
      html: sampleHtml,
      css: sampleCss,
    });
    publishLatestDraft();

    const secondHtml = sampleHtml.replace("Exacty", "Exacty v2");
    const second = saveDraftFromEditor({
      project: sampleProject,
      html: secondHtml,
      css: sampleCss,
    });

    expect(second.versionId).not.toBe(first.versionId);
    expect(getStorageRepository().loadPublished()?.html).toContain("Exacty</h1>");
    expect(getStorageRepository().loadPublished()?.html).not.toContain("Exacty v2");

    const published = publishLatestDraft();
    expect(published.versionId).toBe(second.versionId);
    expect(published.html).toContain("Exacty v2");
  });
});

describe("validateDraftSnapshot", () => {
  it("accepts a consistent snapshot", () => {
    const draft = saveDraftFromEditor({
      project: sampleProject,
      html: sampleHtml,
      css: sampleCss,
    });
    expect(validateDraftSnapshot(draft)).toEqual({ ok: true });
  });
});
