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
  // #region agent log
  fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9176a5",
    },
    body: JSON.stringify({
      sessionId: "9176a5",
      runId: "post-fix",
      hypothesisId: "A",
      location: "repositories/index.ts:resolveCmsStorageProvider",
      message: "storage provider resolved",
      data: {
        injected: injected ?? null,
        metaVite: meta.VITE_CMS_STORAGE_PROVIDER ?? null,
        metaViteAlt: meta.VITE_STORAGE_PROVIDER ?? null,
        resolved,
        mode: import.meta.env.MODE,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
  // #region agent log
  fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "9176a5",
    },
    body: JSON.stringify({
      sessionId: "9176a5",
      runId: "post-fix",
      hypothesisId: "B",
      location: "repositories/index.ts:createStorageRepository",
      message: "repository factory selected",
      data: {
        mode,
        className: repo.constructor.name,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
