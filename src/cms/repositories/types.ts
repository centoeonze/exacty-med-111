/**
 * Storage keys used by the CMS localStorage persistence layer.
 * Keep in sync with LOCALSTORAGE_INVENTORY.md.
 */
export const DRAFT_KEY = "exacty-cms-draft";
export const PUBLISHED_KEY = "exacty-cms-published";
export const MEDIA_ASSETS_KEY = "exacty-cms-media-assets";

export type CmsDraft = Record<string, unknown>;

export type CmsPublishedPage = {
  html: string;
  css: string;
  updatedAt: string;
};

export type CmsMediaAssetRow = Record<string, unknown>;
