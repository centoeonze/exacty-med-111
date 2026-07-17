/**
 * Public CMS persistence façade.
 * Delegates to IStorageRepository. Versioned Save/Publish live in draftPublish.ts.
 */
import {
  getStorageRepository,
  type CmsDraft,
  type CmsDraftSnapshot,
  type CmsPublishedPage,
} from "./repositories";
import {
  extractProjectFromStoredDraft,
  normalizePublishedPage,
} from "./draftPublish";

export { DRAFT_KEY, PUBLISHED_KEY } from "./repositories";
export type { CmsDraft, CmsDraftSnapshot, CmsPublishedPage };
export {
  loadDraftSnapshot,
  publishLatestDraft,
  saveDraftFromEditor,
  validateDraftSnapshot,
  extractProjectFromStoredDraft,
  normalizePublishedPage,
} from "./draftPublish";

export type CmsExportPayload = {
  version: 1;
  draft: CmsDraft;
  published?: CmsPublishedPage | null;
  exportedAt: string;
};

/** GrapesJS project for the editor (unwraps draft-v2 snapshots). */
export const loadDraft = (): CmsDraft | null =>
  extractProjectFromStoredDraft(getStorageRepository().loadDraft());

/** Low-level draft write — prefer saveDraftFromEditor for CMS Salvar. */
export const saveDraft = (draft: CmsDraft | CmsDraftSnapshot): void => {
  getStorageRepository().saveDraft(draft);
};

export const clearDraft = (): void => {
  getStorageRepository().clearDraft();
};

/** Public site source of truth (Published only). */
export const loadPublished = (): CmsPublishedPage | null =>
  normalizePublishedPage(getStorageRepository().loadPublished());

/** Low-level published write — prefer publishLatestDraft() for CMS Publicar. */
export const savePublished = (page: {
  html: string;
  css: string;
  versionId?: string;
  publishedAt?: string;
  checksum?: string;
  updatedAt?: string;
  kind?: CmsPublishedPage["kind"];
}): CmsPublishedPage => getStorageRepository().savePublished(page);

export const clearPublished = (): void => {
  getStorageRepository().clearPublished();
};

export const exportCmsJson = (draft: CmsDraft, includePublished = true): void => {
  const payload: CmsExportPayload = {
    version: 1,
    draft,
    published: includePublished ? loadPublished() : null,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exacty-cms-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const parseImportFile = async (file: File): Promise<CmsDraft> => {
  const text = await file.text();
  const data = JSON.parse(text) as CmsExportPayload | CmsDraft;

  if (data && typeof data === "object" && "draft" in data && data.draft) {
    const payload = data as CmsExportPayload;
    if (payload.published?.html) {
      const publishedAt = new Date().toISOString();
      savePublished({
        versionId: payload.published.versionId || `import-${publishedAt}`,
        publishedAt: payload.published.publishedAt || publishedAt,
        checksum: payload.published.checksum || "import",
        html: payload.published.html,
        css: payload.published.css ?? "",
      });
    }
    return extractProjectFromStoredDraft(payload.draft) ?? (payload.draft as CmsDraft);
  }

  return extractProjectFromStoredDraft(data as CmsDraft) ?? (data as CmsDraft);
};
