import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const authProvider = String(
    env.VITE_CMS_AUTH_PROVIDER || env.CMS_AUTH_PROVIDER || "local",
  )
    .trim()
    .toLowerCase();
  const useLocalAuth = authProvider !== "api";
  const storageProvider =
    String(
      env.VITE_CMS_STORAGE_PROVIDER ||
        env.CMS_STORAGE_PROVIDER ||
        env.VITE_STORAGE_PROVIDER ||
        env.STORAGE_PROVIDER ||
        "local",
    )
      .trim()
      .toLowerCase() === "api"
      ? "api"
      : "local";

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
      // Bake storage provider at build time (Hostinger builds may omit .env VITE_*).
      __EXACTY_CMS_STORAGE_PROVIDER__: JSON.stringify(storageProvider),
      "import.meta.env.VITE_CMS_STORAGE_PROVIDER": JSON.stringify(storageProvider),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
