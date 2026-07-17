import type { IStorageRepository } from "./IStorageRepository";
import { ApiStorageRepository } from "./ApiStorageRepository";
import { LocalStorageRepository } from "./LocalStorageRepository";

/**
 * Dual storage: `local` (static Hostinger / localStorage) | `api` (Express KV).
 * Default `local` until Express is published in production.
 */
export type CmsStorageProviderMode = "local" | "api";

export const resolveCmsStorageProviderFrom = (
  raw?: string | null,
): CmsStorageProviderMode =>
  String(raw ?? "local").trim().toLowerCase() === "api" ? "api" : "local";

export const resolveCmsStorageProvider = (): CmsStorageProviderMode => {
  const meta = import.meta.env as ImportMetaEnv & {
    VITE_CMS_STORAGE_PROVIDER?: string;
    VITE_STORAGE_PROVIDER?: string;
    CMS_STORAGE_PROVIDER?: string;
    STORAGE_PROVIDER?: string;
  };
  return resolveCmsStorageProviderFrom(
    meta.VITE_CMS_STORAGE_PROVIDER ??
      meta.VITE_STORAGE_PROVIDER ??
      meta.CMS_STORAGE_PROVIDER ??
      meta.STORAGE_PROVIDER,
  );
};

/** Factory used by the app and by provider tests. */
export const createStorageRepository = (
  mode: CmsStorageProviderMode = resolveCmsStorageProvider(),
): IStorageRepository =>
  mode === "api" ? new ApiStorageRepository() : new LocalStorageRepository();

/** One repository instance for the entire application lifecycle. */
const repository = createStorageRepository();

export const getStorageRepository = (): IStorageRepository => repository;

if (typeof window !== "undefined") {
  (window as unknown as { __CMS_STORAGE_PROVIDER__?: string }).__CMS_STORAGE_PROVIDER__ =
    resolveCmsStorageProvider();
}

export type { IStorageRepository } from "./IStorageRepository";
export { ApiStorageRepository } from "./ApiStorageRepository";
export { LocalStorageRepository } from "./LocalStorageRepository";
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
