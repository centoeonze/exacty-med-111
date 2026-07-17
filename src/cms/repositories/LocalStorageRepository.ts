/**
 * Browser localStorage persistence for static hosting (Hostinger).
 * Used when VITE_CMS_STORAGE_PROVIDER=local. API path remains in ApiStorageRepository.
 */
import type { IStorageRepository } from "./IStorageRepository";
import {
  DRAFT_KEY,
  MEDIA_ASSETS_KEY,
  PUBLISHED_KEY,
  type CmsDraft,
  type CmsMediaAssetRow,
  type CmsPublishedPage,
} from "./types";

const readJson = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const writeJson = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    const message =
      error instanceof DOMException && error.name === "QuotaExceededError"
        ? "Armazenamento do navegador cheio (localStorage). Remova dados antigos ou publique com menos assets embutidos."
        : error instanceof Error
          ? error.message
          : "Falha ao gravar no localStorage.";
    throw new Error(message);
  }
};

export class LocalStorageRepository implements IStorageRepository {
  loadDraft(): CmsDraft | null {
    return readJson<CmsDraft>(DRAFT_KEY);
  }

  saveDraft(draft: CmsDraft): void {
    writeJson(DRAFT_KEY, draft);
  }

  clearDraft(): void {
    localStorage.removeItem(DRAFT_KEY);
  }

  loadPublished(): CmsPublishedPage | null {
    const data = readJson<CmsPublishedPage>(PUBLISHED_KEY);
    if (!data?.html) return null;
    return data;
  }

  savePublished(page: Omit<CmsPublishedPage, "updatedAt">): CmsPublishedPage {
    const payload: CmsPublishedPage = {
      ...page,
      updatedAt: new Date().toISOString(),
    };
    writeJson(PUBLISHED_KEY, payload);
    return payload;
  }

  clearPublished(): void {
    localStorage.removeItem(PUBLISHED_KEY);
  }

  loadMediaAssets(): CmsMediaAssetRow[] {
    const data = readJson<CmsMediaAssetRow[]>(MEDIA_ASSETS_KEY);
    return Array.isArray(data) ? data : [];
  }

  saveMediaAssets(assets: CmsMediaAssetRow[]): void {
    writeJson(MEDIA_ASSETS_KEY, assets);
  }
}
