/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CMS_STORAGE_PROVIDER?: string;
  readonly VITE_STORAGE_PROVIDER?: string;
  /** Documented alias; Vite only exposes VITE_* to the client by default. */
  readonly CMS_STORAGE_PROVIDER?: string;
  /** `local` (static Hostinger) | `api` (Express). Default: local. */
  readonly VITE_CMS_AUTH_PROVIDER?: string;
  readonly CMS_AUTH_PROVIDER?: string;
  readonly VITE_CMS_USERNAME?: string;
  readonly VITE_CMS_PASSWORD?: string;
}

/** Injected by vite.config — `local` | `api`. */
declare const __EXACTY_CMS_STORAGE_PROVIDER__: "local" | "api" | undefined;

/** Injected by vite.config when AUTH_PROVIDER=local; null in api mode. */
declare const __EXACTY_CMS_LOCAL_CREDS__: {
  username: string;
  password: string;
} | null;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.pdf" {
  const src: string;
  export default src;
}
