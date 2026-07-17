import type {
  CmsDraft,
  CmsDraftSnapshot,
  CmsMediaAssetRow,
  CmsPublishedPage,
} from "./types";

/**
 * Domain storage contract for the CMS.
 * Callers depend only on this interface — never on localStorage or HTTP directly.
 *
 * Draft values may be a versioned CmsDraftSnapshot or a legacy raw GrapesJS project.
 */
export interface IStorageRepository {
  loadDraft(): CmsDraft | CmsDraftSnapshot | null;
  saveDraft(draft: CmsDraft | CmsDraftSnapshot): void;
  clearDraft(): void;

  loadPublished(): CmsPublishedPage | null;
  /** Accepts full published snapshots or legacy { html, css } rows. */
  savePublished(
    page: {
      html: string;
      css: string;
      versionId?: string;
      publishedAt?: string;
      checksum?: string;
      updatedAt?: string;
      kind?: CmsPublishedPage["kind"];
    },
  ): CmsPublishedPage;
  clearPublished(): void;

  loadMediaAssets(): CmsMediaAssetRow[];
  saveMediaAssets(assets: CmsMediaAssetRow[]): void;
}
