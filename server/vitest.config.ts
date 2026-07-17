import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    // Shared SQLite file — avoid parallel files clearing each other.
    fileParallelism: false,
  },
});
