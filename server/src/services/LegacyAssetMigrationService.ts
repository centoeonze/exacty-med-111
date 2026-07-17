import type { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../repositories/SqliteStorageRepository.js";
import { SqliteStorageRepository } from "../repositories/SqliteStorageRepository.js";
import { AssetService } from "./AssetService.js";

export const DRAFT_KEY = "exacty-cms-draft";
export const PUBLISHED_KEY = "exacty-cms-published";
export const MEDIA_ASSETS_KEY = "exacty-cms-media-assets";

const CMS_KEYS = [DRAFT_KEY, PUBLISHED_KEY, MEDIA_ASSETS_KEY] as const;

export type DataUrlHit = {
  key: string;
  mime: string;
  approxBytes: number;
  preview: string;
  context: "catalog-src" | "embedded-json" | "unknown";
};

export type LegacyDataAuditReport = {
  inspectedAt: string;
  storageEntriesScanned: number;
  dataUrlCount: number;
  totalApproxBytes: number;
  byKey: Record<string, { count: number; approxBytes: number }>;
  byMime: Record<string, number>;
  hits: DataUrlHit[];
};

export type LegacyAssetMigrationResult = {
  mode: "report" | "execute";
  startedAt: string;
  finishedAt: string;
  audit: LegacyDataAuditReport;
  converted: number;
  skippedDuplicates: number;
  referencesUpdated: number;
  assetsCreated: string[];
  errors: string[];
  warnings: string[];
  remainingDataUrls: number;
  ok: boolean;
};

const DATA_URL_RE = /data:([^;,]+)?(;base64)?,([A-Za-z0-9+/=_%.-]+)/gi;

const parseDataUrl = (src: string) => {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(src);
  if (!match) return null;
  const mime = (match[1] || "application/octet-stream").toLowerCase();
  const isBase64 = Boolean(match[2]);
  const payload = match[3] || "";
  try {
    const buffer = isBase64
      ? Buffer.from(payload, "base64")
      : Buffer.from(decodeURIComponent(payload), "utf8");
    return { mime, buffer };
  } catch {
    return null;
  }
};

const collectDataUrls = (value: unknown, found: Set<string>) => {
  if (typeof value === "string") {
    if (value.startsWith("data:")) {
      found.add(value);
      return;
    }
    DATA_URL_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = DATA_URL_RE.exec(value))) {
      found.add(m[0]);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectDataUrls(item, found));
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectDataUrls(v, found);
    }
  }
};

const replaceInValue = (
  value: unknown,
  replacements: Map<string, string>,
): { value: unknown; changed: number } => {
  let changed = 0;
  if (typeof value === "string") {
    let next = value;
    for (const [from, to] of replacements) {
      if (next.includes(from)) {
        const parts = next.split(from);
        changed += parts.length - 1;
        next = parts.join(to);
      }
    }
    return { value: next, changed };
  }
  if (Array.isArray(value)) {
    const out = value.map((item) => {
      const r = replaceInValue(item, replacements);
      changed += r.changed;
      return r.value;
    });
    return { value: out, changed };
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const r = replaceInValue(v, replacements);
      changed += r.changed;
      out[k] = r.value;
    }
    return { value: out, changed };
  }
  return { value, changed };
};

const extFromMime = (mime: string) => {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("svg")) return "svg";
  return "bin";
};

const inferType = (mime: string) =>
  mime.includes("pdf") ? "pdf" : mime.startsWith("image/") ? "image" : "file";

/**
 * Migrates embedded data: URLs from CMS StorageEntry KV into AssetService files.
 * Does not delete LocalStorage or remove fallback code.
 */
export class LegacyAssetMigrationService {
  private readonly prisma: PrismaClient;
  private readonly kv: SqliteStorageRepository;
  private readonly assets: AssetService;

  constructor(options?: {
    prisma?: PrismaClient;
    uploadsDir?: string;
    assetService?: AssetService;
  }) {
    this.prisma = options?.prisma ?? getPrismaClient();
    this.kv = new SqliteStorageRepository(this.prisma);
    this.assets =
      options?.assetService ??
      new AssetService({
        prisma: this.prisma,
        uploadsDir: options?.uploadsDir,
      });
  }

  private recordHits(
    sourceKey: string,
    value: unknown,
    context: DataUrlHit["context"],
    byKey: Record<string, { count: number; approxBytes: number }>,
    byMime: Record<string, number>,
    hits: DataUrlHit[],
  ): { count: number; bytes: number } {
    const found = new Set<string>();
    collectDataUrls(value, found);
    let count = 0;
    let bytes = 0;
    for (const dataUrl of found) {
      const parsedUrl = parseDataUrl(dataUrl);
      const mime = parsedUrl?.mime || "unknown";
      const approxBytes = parsedUrl?.buffer.length ?? dataUrl.length;
      count += 1;
      bytes += approxBytes;
      byKey[sourceKey] = byKey[sourceKey] || { count: 0, approxBytes: 0 };
      byKey[sourceKey].count += 1;
      byKey[sourceKey].approxBytes += approxBytes;
      byMime[mime] = (byMime[mime] || 0) + 1;
      hits.push({
        key: sourceKey,
        mime,
        approxBytes,
        preview: dataUrl.slice(0, 64) + (dataUrl.length > 64 ? "…" : ""),
        context,
      });
    }
    return { count, bytes };
  }

  async audit(): Promise<LegacyDataAuditReport> {
    const entries = await this.prisma.storageEntry.findMany({
      select: { key: true, value: true },
    });

    const byKey: Record<string, { count: number; approxBytes: number }> = {};
    const byMime: Record<string, number> = {};
    const hits: DataUrlHit[] = [];
    let dataUrlCount = 0;
    let totalApproxBytes = 0;

    for (const entry of entries) {
      let parsed: unknown = entry.value;
      try {
        parsed = JSON.parse(entry.value);
      } catch {
        parsed = entry.value;
      }
      const context: DataUrlHit["context"] =
        entry.key === MEDIA_ASSETS_KEY ? "catalog-src" : "embedded-json";
      const r = this.recordHits(entry.key, parsed, context, byKey, byMime, hits);
      dataUrlCount += r.count;
      totalApproxBytes += r.bytes;
    }

    const pages = await this.prisma.page.findMany({ select: { id: true, content: true } });
    for (const page of pages) {
      const r = this.recordHits(
        `Page:${page.id}`,
        page.content,
        "embedded-json",
        byKey,
        byMime,
        hits,
      );
      dataUrlCount += r.count;
      totalApproxBytes += r.bytes;
    }

    const versions = await this.prisma.version.findMany({
      select: { id: true, content: true },
    });
    for (const version of versions) {
      const r = this.recordHits(
        `Version:${version.id}`,
        version.content,
        "embedded-json",
        byKey,
        byMime,
        hits,
      );
      dataUrlCount += r.count;
      totalApproxBytes += r.bytes;
    }

    return {
      inspectedAt: new Date().toISOString(),
      storageEntriesScanned: entries.length,
      dataUrlCount,
      totalApproxBytes,
      byKey,
      byMime,
      hits,
    };
  }

  async migrate(options: { dryRun: boolean }): Promise<LegacyAssetMigrationResult> {
    const startedAt = new Date().toISOString();
    const audit = await this.audit();
    const errors: string[] = [];
    const warnings: string[] = [];
    const assetsCreated: string[] = [];
    let converted = 0;
    let skippedDuplicates = 0;
    let referencesUpdated = 0;

    // Re-collect full data URLs from StorageEntry + domain Page/Version content
    const allDataUrls = new Set<string>();
    const entries = await this.prisma.storageEntry.findMany();
    for (const entry of entries) {
      try {
        collectDataUrls(JSON.parse(entry.value), allDataUrls);
      } catch {
        collectDataUrls(entry.value, allDataUrls);
      }
    }

    const pages = await this.prisma.page.findMany({ select: { id: true, content: true } });
    const versions = await this.prisma.version.findMany({
      select: { id: true, content: true },
    });
    for (const page of pages) collectDataUrls(page.content, allDataUrls);
    for (const version of versions) collectDataUrls(version.content, allDataUrls);

    const replacements = new Map<string, string>();
    const bufferHashSeen = new Map<string, string>();

    for (const dataUrl of allDataUrls) {
      const parsed = parseDataUrl(dataUrl);
      if (!parsed) {
        warnings.push(`Could not parse data URL (${dataUrl.slice(0, 40)}…)`);
        continue;
      }

      const hash = `${parsed.mime}:${parsed.buffer.length}:${parsed.buffer.toString("base64").slice(0, 64)}`;
      const existingUrl = bufferHashSeen.get(hash);
      if (existingUrl) {
        replacements.set(dataUrl, existingUrl);
        skippedDuplicates += 1;
        continue;
      }

      if (options.dryRun) {
        const dryUrl = `/uploads/dry-run-${converted}.${extFromMime(parsed.mime)}`;
        replacements.set(dataUrl, dryUrl);
        bufferHashSeen.set(hash, dryUrl);
        converted += 1;
        continue;
      }

      try {
        const asset = await this.assets.upload({
          buffer: parsed.buffer,
          originalName: `legacy-${converted}.${extFromMime(parsed.mime)}`,
          mimeType: parsed.mime,
          type: inferType(parsed.mime),
        });
        replacements.set(dataUrl, asset.url);
        bufferHashSeen.set(hash, asset.url);
        assetsCreated.push(asset.id);
        converted += 1;
      } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
      }
    }

    if (replacements.size > 0) {
      for (const key of CMS_KEYS) {
        const current = await this.kv.get(key);
        if (current == null) continue;
        const { value, changed } = replaceInValue(current, replacements);
        if (changed > 0) {
          referencesUpdated += changed;
          if (!options.dryRun) {
            await this.kv.set(key, value);
          }
        }
      }

      // Also rewrite any other StorageEntry that still embeds data URLs
      for (const entry of entries) {
        if ((CMS_KEYS as readonly string[]).includes(entry.key)) continue;
        try {
          const current = JSON.parse(entry.value);
          const { value, changed } = replaceInValue(current, replacements);
          if (changed > 0) {
            referencesUpdated += changed;
            if (!options.dryRun) {
              await this.kv.set(entry.key, value);
            }
          }
        } catch {
          /* skip non-json */
        }
      }

      for (const page of pages) {
        const { value, changed } = replaceInValue(page.content, replacements);
        if (changed > 0) {
          referencesUpdated += changed;
          if (!options.dryRun) {
            await this.prisma.page.update({
              where: { id: page.id },
              data: { content: value as object },
            });
          }
        }
      }

      for (const version of versions) {
        const { value, changed } = replaceInValue(version.content, replacements);
        if (changed > 0) {
          referencesUpdated += changed;
          if (!options.dryRun) {
            await this.prisma.version.update({
              where: { id: version.id },
              data: { content: value as object },
            });
          }
        }
      }
    }

    // Enrich media catalog rows with assetId when we can match by url
    if (!options.dryRun && assetsCreated.length > 0) {
      const media = await this.kv.get<Array<Record<string, unknown>>>(MEDIA_ASSETS_KEY);
      if (Array.isArray(media)) {
        const urlToId = new Map<string, string>();
        for (const id of assetsCreated) {
          const row = await this.prisma.asset.findUnique({ where: { id } });
          if (row) urlToId.set(row.url, row.id);
        }
        const next = media.map((row) => {
          const src = String(row.src || "");
          const assetId = urlToId.get(src);
          return assetId ? { ...row, assetId } : row;
        });
        await this.kv.set(MEDIA_ASSETS_KEY, next);
      }
    }

    const postAudit = options.dryRun ? audit : await this.audit();
    const finishedAt = new Date().toISOString();

    return {
      mode: options.dryRun ? "report" : "execute",
      startedAt,
      finishedAt,
      audit,
      converted,
      skippedDuplicates,
      referencesUpdated,
      assetsCreated,
      errors,
      warnings,
      remainingDataUrls: postAudit.dataUrlCount,
      ok: errors.length === 0 && (options.dryRun || postAudit.dataUrlCount === 0),
    };
  }

  static formatAuditMarkdown(audit: LegacyDataAuditReport): string {
    const lines = [
      "# Legacy Data Migration Report",
      "",
      `Inspected at: ${audit.inspectedAt}`,
      `StorageEntry rows scanned: ${audit.storageEntriesScanned}`,
      `Data URLs found: ${audit.dataUrlCount}`,
      `Approx total bytes: ${audit.totalApproxBytes}`,
      "",
      "## By StorageEntry key",
      "",
      "| Key | Count | Approx bytes |",
      "|-----|------:|-------------:|",
      ...Object.entries(audit.byKey).map(
        ([k, v]) => `| \`${k}\` | ${v.count} | ${v.approxBytes} |`,
      ),
      ...(Object.keys(audit.byKey).length ? [] : ["| — | 0 | 0 |"]),
      "",
      "## By MIME",
      "",
      "| MIME | Count |",
      "|------|------:|",
      ...Object.entries(audit.byMime).map(([m, c]) => `| \`${m}\` | ${c} |`),
      ...(Object.keys(audit.byMime).length ? [] : ["| — | 0 |"]),
      "",
      "## Notes",
      "",
      "- Origins: StorageEntry (`exacty-cms-draft`, `exacty-cms-published`, `exacty-cms-media-assets`), plus `Page` / `Version` JSON.",
      "- Stage 9C migrates these into `uploads/` + `Asset` rows and rewrites references to `/uploads/...`.",
      "- Browser LocalStorage keys are out of scope for this server migration (historical: LegacyStorageInspector docs).",
      "",
    ];
    return lines.join("\n");
  }

  static formatMigrationMarkdown(result: LegacyAssetMigrationResult): string {
    return [
      "# Legacy Asset Migration Result",
      "",
      `Mode: **${result.mode}**`,
      `Started: ${result.startedAt}`,
      `Finished: ${result.finishedAt}`,
      `OK: ${result.ok}`,
      "",
      "## Summary",
      "",
      `| Metric | Value |`,
      `|---|---:|`,
      `| Data URLs (pre-audit) | ${result.audit.dataUrlCount} |`,
      `| Converted | ${result.converted} |`,
      `| Skipped duplicates | ${result.skippedDuplicates} |`,
      `| References updated | ${result.referencesUpdated} |`,
      `| Assets created | ${result.assetsCreated.length} |`,
      `| Remaining data URLs | ${result.remainingDataUrls} |`,
      "",
      result.errors.length
        ? `## Errors\n\n${result.errors.map((e) => `- ${e}`).join("\n")}\n`
        : "",
      result.warnings.length
        ? `## Warnings\n\n${result.warnings.map((w) => `- ${w}`).join("\n")}\n`
        : "",
      LegacyAssetMigrationService.formatAuditMarkdown(result.audit),
    ]
      .filter(Boolean)
      .join("\n");
  }
}
