/**
 * Storage keys and CMS content version types.
 * Keep in sync with LOCALSTORAGE_INVENTORY.md.
 */
export const DRAFT_KEY = "exacty-cms-draft";
export const PUBLISHED_KEY = "exacty-cms-published";
export const MEDIA_ASSETS_KEY = "exacty-cms-media-assets";

/** GrapesJS project JSON (editor tree). */
export type CmsProjectData = Record<string, unknown>;

/**
 * Legacy alias: raw GrapesJS project OR (when reading from storage) may be a
 * versioned snapshot — use helpers in draftPublish.ts to normalize.
 */
export type CmsDraft = CmsProjectData;

export const DRAFT_SNAPSHOT_KIND = "exacty-cms-draft-v2" as const;
export const PUBLISHED_SNAPSHOT_KIND = "exacty-cms-published-v2" as const;

/** Last saved editor state — source of truth for Preview and for Publish. */
export type CmsDraftSnapshot = {
  kind: typeof DRAFT_SNAPSHOT_KIND;
  versionId: string;
  updatedAt: string;
  checksum: string;
  project: CmsProjectData;
  html: string;
  css: string;
};

/** Public site snapshot — promoted copy of a Draft (same versionId/checksum). */
export type CmsPublishedPage = {
  kind?: typeof PUBLISHED_SNAPSHOT_KIND;
  versionId: string;
  publishedAt: string;
  checksum: string;
  html: string;
  css: string;
  /** Kept in sync with publishedAt for older readers / Index. */
  updatedAt: string;
};

export type CmsMediaAssetRow = Record<string, unknown>;
