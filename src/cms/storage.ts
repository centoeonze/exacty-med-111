export const DRAFT_KEY = "exacty-cms-draft";
export const PUBLISHED_KEY = "exacty-cms-published";

export type CmsDraft = Record<string, unknown>;

export type CmsPublishedPage = {
  html: string;
  css: string;
  updatedAt: string;
};

export type CmsExportPayload = {
  version: 1;
  draft: CmsDraft;
  published?: CmsPublishedPage | null;
  exportedAt: string;
};

export const loadDraft = (): CmsDraft | null => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CmsDraft;
  } catch {
    return null;
  }
};

export const saveDraft = (draft: CmsDraft): void => {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
};

export const clearDraft = (): void => {
  localStorage.removeItem(DRAFT_KEY);
};

export const loadPublished = (): CmsPublishedPage | null => {
  try {
    const raw = localStorage.getItem(PUBLISHED_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as CmsPublishedPage;
    if (!data?.html) return null;
    return data;
  } catch {
    return null;
  }
};

export const savePublished = (page: Omit<CmsPublishedPage, "updatedAt">): CmsPublishedPage => {
  const payload: CmsPublishedPage = {
    ...page,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(PUBLISHED_KEY, JSON.stringify(payload));
  return payload;
};

export const clearPublished = (): void => {
  localStorage.removeItem(PUBLISHED_KEY);
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
