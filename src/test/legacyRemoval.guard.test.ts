import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const SOURCE_GLOBS = [
  path.join(root, "src"),
  path.join(root, "vite.config.ts"),
];

const FORBIDDEN = [
  {
    pattern: /FallbackStorageRepository/,
    label: "FallbackStorageRepository",
  },
  {
    pattern: /LegacyStorageInspector/,
    label: "LegacyStorageInspector",
  },
  {
    pattern: /STORAGE_PROVIDER_FALLBACK/,
    label: "STORAGE_PROVIDER_FALLBACK",
  },
  {
    pattern: /\/api\/cms-auth/,
    label: "/api/cms-auth",
  },
  {
    pattern: /vite-plugin-cms-auth/,
    label: "vite-plugin-cms-auth",
  },
  {
    pattern: /readAsDataURL/,
    label: "readAsDataURL",
  },
  {
    pattern: /uploadFileLegacyBase64|VITE_CMS_ASSET_UPLOAD/,
    label: "legacy upload path",
  },
  {
    pattern: /__CMS_FALLBACK_METRICS__|__CMS_UPLOAD_FALLBACK_METRICS__|__CMS_LEGACY_STORAGE__/,
    label: "legacy runtime metrics",
  },
];

const collectFiles = (entry: string, out: string[] = []): string[] => {
  const stat = fs.statSync(entry);
  if (stat.isFile()) {
    if (/\.(ts|tsx|js|jsx)$/.test(entry)) out.push(entry);
    return out;
  }
  for (const name of fs.readdirSync(entry)) {
    if (name === "node_modules" || name === "dist") continue;
    collectFiles(path.join(entry, name), out);
  }
  return out;
};

describe("legacyRemoval.guard (Stage 10A)", () => {
  it("src + vite.config have no legacy storage/auth/upload references", () => {
    const files = SOURCE_GLOBS.flatMap((p) => collectFiles(p));
    const hits: string[] = [];

    for (const file of files) {
      // Guard test itself may mention forbidden names in comments — skip self
      if (file.endsWith("legacyRemoval.guard.test.ts")) continue;
      const text = fs.readFileSync(file, "utf8");
      for (const rule of FORBIDDEN) {
        if (rule.pattern.test(text)) {
          hits.push(`${path.relative(root, file)} → ${rule.label}`);
        }
      }
    }

    expect(hits).toEqual([]);
  });

  it("resolve helpers support local|api for auth/storage; upload remains api", async () => {
    const { resolveCmsStorageProvider } = await import("@/cms/repositories");
    const { resolveCmsAuthProvider } = await import("@/cms/auth/cmsAuthApi");
    const { resolveCmsAssetUploadMode } = await import("@/cms/mediaManager");
    expect(["local", "api"]).toContain(resolveCmsStorageProvider());
    expect(["local", "api"]).toContain(resolveCmsAuthProvider());
    expect(resolveCmsAssetUploadMode()).toBe("api");
  });
});
