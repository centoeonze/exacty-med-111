import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Parse .env files for a Vite mode WITHOUT merging process.env.
 * Vite's loadEnv(prefix "") lets ambient process.env overwrite file values —
 * that baked ApiStorage into static Hostinger builds when CI had STORAGE_PROVIDER=api.
 */
const parseEnvFile = (filePath: string): Record<string, string> => {
  if (!fs.existsSync(filePath)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
};

/** Later files win (.env → .env.local → .env.[mode] → .env.[mode].local). */
const loadEnvFilesOnly = (mode: string, envDir: string): Record<string, string> => {
  const files = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];
  const env: Record<string, string> = {};
  for (const file of files) {
    Object.assign(env, parseEnvFile(path.join(envDir, file)));
  }
  return env;
};

const resolveStorageProviderFromFiles = (
  mode: string,
  envDir: string,
): "local" | "api" => {
  const fileEnv = loadEnvFilesOnly(mode, envDir);
  const raw =
    fileEnv.VITE_CMS_STORAGE_PROVIDER ||
    fileEnv.CMS_STORAGE_PROVIDER ||
    fileEnv.VITE_STORAGE_PROVIDER ||
    fileEnv.STORAGE_PROVIDER ||
    // Absent → local. Never auto-select api (static Hostinger has no Express).
    "local";
  return String(raw).trim().toLowerCase() === "api" ? "api" : "local";
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");
  const authProvider = String(
    env.VITE_CMS_AUTH_PROVIDER || env.CMS_AUTH_PROVIDER || "local",
  )
    .trim()
    .toLowerCase();
  const useLocalAuth = authProvider !== "api";

  // Storage: file-only resolution (ignores polluted process.env from Hostinger/CI).
  // Modes api/staging still pick api via .env.api / .env.staging committed files.
  const storageProvider = resolveStorageProviderFromFiles(mode, rootDir);

  if (process.env.EXACTY_DEBUG_STORAGE_BAKE === "1") {
    // eslint-disable-next-line no-console
    console.info(
      `[Exacty build] mode=${mode} storageProvider=${storageProvider} (file-only; process.env ignored for storage)`,
    );
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: {
        // Stage 10A — all /api/* (storage, auth, assets) → Express
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        // Stage 8 — uploaded assets served by Express
        "/uploads": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
      },
    },
    define: {
      // Local auth only: embed CMS_USERNAME/PASSWORD for static hosting (Hostinger).
      // API mode keeps null so credentials are not bundled.
      __EXACTY_CMS_LOCAL_CREDS__: useLocalAuth
        ? JSON.stringify({
            username: String(env.CMS_USERNAME || env.VITE_CMS_USERNAME || "").trim(),
            password: String(env.CMS_PASSWORD || env.VITE_CMS_PASSWORD || ""),
          })
        : "null",
      // Bake storage provider at build time from .env files only (default local).
      __EXACTY_CMS_STORAGE_PROVIDER__: JSON.stringify(storageProvider),
      "import.meta.env.VITE_CMS_STORAGE_PROVIDER": JSON.stringify(storageProvider),
      // Pin alternate key too — Vite may otherwise inject polluted process.env.VITE_STORAGE_PROVIDER.
      "import.meta.env.VITE_STORAGE_PROVIDER": JSON.stringify(storageProvider),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src"),
      },
    },
  };
});
