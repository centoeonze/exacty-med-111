import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  define: {
    // Unit tests default to no injected local creds (use VITE_CMS_* stubs instead).
    __EXACTY_CMS_LOCAL_CREDS__: "null",
    __EXACTY_CMS_STORAGE_PROVIDER__: JSON.stringify("local"),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
