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
  // #region agent log
  fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9176a5",
    },
    body: JSON.stringify({
      sessionId: "9176a5",
      runId: "save-post-fix",
      hypothesisId: "A",
      location: "storage.ts:saveDraft",
      message: "saveDraft invoked",
      data: {
        provider:
          (typeof window !== "undefined" &&
            (window as unknown as { __CMS_STORAGE_PROVIDER__?: string })
              .__CMS_STORAGE_PROVIDER__) ||
          null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  getStorageRepository().saveDraft(draft);
};

export const clearDraft = (): void => {
  getStorageRepository().clearDraft();
};

export const loadPublished = (): CmsPublishedPage | null => getStorageRepository().loadPublished();

export const savePublished = (page: Omit<CmsPublishedPage, "updatedAt">): CmsPublishedPage => {
  // #region agent log
  fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9176a5",
    },
    body: JSON.stringify({
      sessionId: "9176a5",
      runId: "save-post-fix",
      hypothesisId: "A",
      location: "storage.ts:savePublished",
      message: "savePublished invoked",
      data: {
        provider:
          (typeof window !== "undefined" &&
            (window as unknown as { __CMS_STORAGE_PROVIDER__?: string })
              .__CMS_STORAGE_PROVIDER__) ||
          null,
        htmlLen: page.html?.length ?? 0,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return getStorageRepository().savePublished(page);
};

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
