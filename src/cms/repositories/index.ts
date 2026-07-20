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
  const injected =
    typeof __EXACTY_CMS_STORAGE_PROVIDER__ !== "undefined"
      ? __EXACTY_CMS_STORAGE_PROVIDER__
      : undefined;
  const meta = import.meta.env as ImportMetaEnv & {
    VITE_CMS_STORAGE_PROVIDER?: string;
    VITE_STORAGE_PROVIDER?: string;
    CMS_STORAGE_PROVIDER?: string;
    STORAGE_PROVIDER?: string;
  };
  const resolved = resolveCmsStorageProviderFrom(
    injected ??
      meta.VITE_CMS_STORAGE_PROVIDER ??
      meta.VITE_STORAGE_PROVIDER ??
      meta.CMS_STORAGE_PROVIDER ??
      meta.STORAGE_PROVIDER,
  );
  return resolved;
};

/** Factory used by the app and by provider tests. */
export const createStorageRepository = (
  mode: CmsStorageProviderMode = resolveCmsStorageProvider(),
): IStorageRepository => {
  const repo =
    mode === "api" ? new ApiStorageRepository() : new LocalStorageRepository();
  // Acceptance / deploy diagnostics (static Hostinger must show local).
  // eslint-disable-next-line no-console
  console.info(`Storage Provider: ${mode}`);
  // eslint-disable-next-line no-console
  console.info(`Repository: ${repo.constructor.name}`);
  return repo;
};

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
  DRAFT_SNAPSHOT_KIND,
  PUBLISHED_SNAPSHOT_KIND,
  type CmsDraft,
  type CmsDraftSnapshot,
  type CmsProjectData,
  type CmsPublishedPage,
  type CmsMediaAssetRow,
} from "./types";
