import type { IStorageRepository } from "./IStorageRepository";
import { ApiStorageRepository } from "./ApiStorageRepository";

/**
 * Stage 10A — API is the only storage provider.
 * LocalStorage / fallback wrappers were removed.
 */
export type CmsStorageProviderMode = "api";

export const resolveCmsStorageProviderFrom = (
  _raw?: string | null,
): CmsStorageProviderMode => "api";

export const resolveCmsStorageProvider = (): CmsStorageProviderMode => "api";

/** Factory used by the app and by provider tests. Always returns API repository. */
export const createStorageRepository = (
  _mode?: CmsStorageProviderMode,
): IStorageRepository => new ApiStorageRepository();

/** One repository instance for the entire application lifecycle. */
const repository = createStorageRepository();

export const getStorageRepository = (): IStorageRepository => repository;

if (typeof window !== "undefined") {
  (window as unknown as { __CMS_STORAGE_PROVIDER__?: string }).__CMS_STORAGE_PROVIDER__ =
    "api";
}

export type { IStorageRepository } from "./IStorageRepository";
export { ApiStorageRepository } from "./ApiStorageRepository";
export {
  MemoryKeyValueStorage,
  HttpKeyValueStorage,
  type IKeyValueStorage,
} from "./keyValueStorage";
export {
  DRAFT_KEY,
  PUBLISHED_KEY,
  MEDIA_ASSETS_KEY,
  type CmsDraft,
  type CmsPublishedPage,
  type CmsMediaAssetRow,
} from "./types";
