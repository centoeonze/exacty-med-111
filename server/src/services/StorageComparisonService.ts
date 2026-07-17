export type ComparisonDomain = "draft" | "published" | "mediaAssets";

export type ComparisonDiff = {
  domain: ComparisonDomain;
  equal: boolean;
  message: string;
};

export type ComparisonResult = {
  equal: boolean;
  diffs: ComparisonDiff[];
};

const stableStringify = (value: unknown): string => {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
};

/**
 * Compares localStorage-shaped payloads with API/SQLite-shaped payloads.
 * Used for shadow-read audits before switching STORAGE_PROVIDER to api.
 */
export class StorageComparisonService {
  compare(local: {
    draft?: unknown;
    published?: unknown;
    mediaAssets?: unknown;
  }, remote: {
    draft?: unknown;
    published?: unknown;
    mediaAssets?: unknown;
  }): ComparisonResult {
    const diffs: ComparisonDiff[] = [];

    const check = (domain: ComparisonDomain, a: unknown, b: unknown) => {
      const equal = stableStringify(a ?? null) === stableStringify(b ?? null);
      diffs.push({
        domain,
        equal,
        message: equal
          ? `${domain}: equal`
          : `${domain}: divergence between local and remote`,
      });
    };

    check("draft", local.draft, remote.draft);
    check("published", local.published, remote.published);
    check("mediaAssets", local.mediaAssets, remote.mediaAssets);

    return {
      equal: diffs.every((d) => d.equal),
      diffs,
    };
  }
}
