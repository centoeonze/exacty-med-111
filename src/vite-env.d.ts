/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CMS_STORAGE_PROVIDER?: string;
  /** Documented alias; Vite only exposes VITE_* to the client by default. */
  readonly CMS_STORAGE_PROVIDER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.pdf" {
  const src: string;
  export default src;
}
