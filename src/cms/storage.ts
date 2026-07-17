/**
 * Public CMS persistence façade.
 * Delegates to IStorageRepository — callers keep the same sync API.
 */
import {
  getStorageRepository,
  type CmsDraft,
  type CmsPublishedPage,
} from "./repositories";

export { DRAFT_KEY, PUBLISHED_KEY } from "./repositories";
export type { CmsDraft, CmsPublishedPage };

export type CmsExportPayload = {
  version: 1;
  draft: CmsDraft;
  published?: CmsPublishedPage | null;
  exportedAt: string;
};

export const loadDraft = (): CmsDraft | null => getStorageRepository().loadDraft();

export const saveDraft = (draft: CmsDraft): void => {
  getStorageRepository().saveDraft(draft);
};

export const clearDraft = (): void => {
  getStorageRepository().clearDraft();
};

export const loadPublished = (): CmsPublishedPage | null => getStorageRepository().loadPublished();

export const savePublished = (page: Omit<CmsPublishedPage, "updatedAt">): CmsPublishedPage =>
  getStorageRepository().savePublished(page);

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
      savePublished({ html: payload.published.html, css: payload.published.css ?? "" });
    }
    return payload.draft;
  }

  return data as CmsDraft;
};
