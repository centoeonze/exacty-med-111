import type { CmsDraft, CmsMediaAssetRow, CmsPublishedPage } from "./types";

/**
 * Domain storage contract for the CMS.
 * Callers (Editor, media manager, Home) depend only on this interface —
 * never on localStorage or HTTP directly.
 */
export interface IStorageRepository {
  loadDraft(): CmsDraft | null;
  saveDraft(draft: CmsDraft): void;
  clearDraft(): void;

  loadPublished(): CmsPublishedPage | null;
  savePublished(page: Omit<CmsPublishedPage, "updatedAt">): CmsPublishedPage;
  clearPublished(): void;

  loadMediaAssets(): CmsMediaAssetRow[];
  saveMediaAssets(assets: CmsMediaAssetRow[]): void;
}
