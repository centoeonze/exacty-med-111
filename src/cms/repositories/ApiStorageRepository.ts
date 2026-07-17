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
  type CmsMediaAssetRow,
  type CmsPublishedPage,
} from "./types";

/**
 * Domain storage adapter over the Express key-value API.
 * Default KV backend is HTTP (`/api/storage/:key`).
 * Contract tests inject MemoryKeyValueStorage (no network).
 *
 * Default provider since Stage 7 / exclusive since Stage 10A: STORAGE_PROVIDER=api.
 */
export class ApiStorageRepository implements IStorageRepository {
  constructor(private readonly kv: IKeyValueStorage = new HttpKeyValueStorage()) {}

  loadDraft(): CmsDraft | null {
    return this.kv.get<CmsDraft>(DRAFT_KEY);
  }

  saveDraft(draft: CmsDraft): void {
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

  savePublished(page: Omit<CmsPublishedPage, "updatedAt">): CmsPublishedPage {
    const payload: CmsPublishedPage = {
      ...page,
      updatedAt: new Date().toISOString(),
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
