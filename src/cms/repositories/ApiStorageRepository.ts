import type { IStorageRepository } from "./IStorageRepository";
import {
  HttpKeyValueStorage,
  type IKeyValueStorage,
} from "./keyValueStorage";
import {
  DRAFT_KEY,
  MEDIA_ASSETS_KEY,
  PUBLISHED_KEY,
  type CmsDraft,
  type CmsDraftSnapshot,
  type CmsMediaAssetRow,
  type CmsPublishedPage,
} from "./types";

/**
 * Domain storage adapter over the Express key-value API.
 * Selected when VITE_CMS_STORAGE_PROVIDER=api.
 */
export class ApiStorageRepository implements IStorageRepository {
  constructor(private readonly kv: IKeyValueStorage = new HttpKeyValueStorage()) {}

  loadDraft(): CmsDraft | CmsDraftSnapshot | null {
    return this.kv.get<CmsDraft | CmsDraftSnapshot>(DRAFT_KEY);
  }

  saveDraft(draft: CmsDraft | CmsDraftSnapshot): void {
    this.kv.set(DRAFT_KEY, draft);
  }

  clearDraft(): void {
    this.kv.remove(DRAFT_KEY);
  }

  loadPublished(): CmsPublishedPage | null {
    const data = this.kv.get<CmsPublishedPage>(PUBLISHED_KEY);
    if (!data?.html) return null;
    return data;
  }

  savePublished(page: {
    html: string;
    css: string;
    versionId?: string;
    publishedAt?: string;
    checksum?: string;
    updatedAt?: string;
    kind?: CmsPublishedPage["kind"];
  }): CmsPublishedPage {
    const publishedAt = page.publishedAt || new Date().toISOString();
    const payload: CmsPublishedPage = {
      ...page,
      publishedAt,
      updatedAt: page.updatedAt || publishedAt,
      versionId: page.versionId || `v-${publishedAt}`,
      checksum: page.checksum || "",
    };
    this.kv.set(PUBLISHED_KEY, payload);
    return payload;
  }

  clearPublished(): void {
    this.kv.remove(PUBLISHED_KEY);
  }

  loadMediaAssets(): CmsMediaAssetRow[] {
    const data = this.kv.get<CmsMediaAssetRow[]>(MEDIA_ASSETS_KEY);
    return Array.isArray(data) ? data : [];
  }

  saveMediaAssets(assets: CmsMediaAssetRow[]): void {
    this.kv.set(MEDIA_ASSETS_KEY, assets);
  }
}
