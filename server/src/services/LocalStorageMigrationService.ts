import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../repositories/SqliteStorageRepository.js";
import {
  PrismaAssetRepository,
  PrismaPageRepository,
  PrismaProjectRepository,
  PrismaVersionRepository,
} from "../repositories/prismaCmsRepositories.js";

export type LocalStorageSnapshot = {
  draft?: unknown;
  published?: unknown;
  mediaAssets?: unknown;
};

export type MigrationReport = {
  startedAt: string;
  finishedAt?: string;
  projectId?: string;
  projectSlug: string;
  pagesCreated: number;
  versionsCreated: number;
  assetsCreated: number;
  assetsSkippedBase64Extracted: number;
  assetsSkippedInvalid: number;
  warnings: string[];
  errors: string[];
  ok: boolean;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const extFromMime = (mime: string) => {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("svg")) return "svg";
  return "bin";
};

const parseDataUrl = (src: string) => {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(src);
  if (!match) return null;
  const mime = match[1] || "application/octet-stream";
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

export type LocalStorageMigrationOptions = {
  prisma?: PrismaClient;
  uploadsDir?: string;
  projectName?: string;
  projectSlug?: string;
  pageName?: string;
  pageSlug?: string;
};

/**
 * Converts a browser localStorage snapshot into Prisma CMS entities.
 * Does not read the browser directly — caller supplies the snapshot JSON.
 */
export class LocalStorageMigrationService {
  private readonly prisma: PrismaClient;
  private readonly uploadsDir: string;
  private readonly projectName: string;
  private readonly projectSlug: string;
  private readonly pageName: string;
  private readonly pageSlug: string;

  constructor(options: LocalStorageMigrationOptions = {}) {
    this.prisma = options.prisma ?? getPrismaClient();
    this.uploadsDir =
      options.uploadsDir ?? path.resolve(process.cwd(), "uploads");
    this.projectName = options.projectName ?? "CMS Migrated Project";
    this.projectSlug = options.projectSlug ?? `cms-migrated-${Date.now()}`;
    this.pageName = options.pageName ?? "Home";
    this.pageSlug = options.pageSlug ?? "home";
  }

  async migrate(snapshot: LocalStorageSnapshot): Promise<MigrationReport> {
    const report: MigrationReport = {
      startedAt: new Date().toISOString(),
      projectSlug: this.projectSlug,
      pagesCreated: 0,
      versionsCreated: 0,
      assetsCreated: 0,
      assetsSkippedBase64Extracted: 0,
      assetsSkippedInvalid: 0,
      warnings: [],
      errors: [],
      ok: false,
    };

    const projects = new PrismaProjectRepository(this.prisma);
    const pages = new PrismaPageRepository(this.prisma);
    const versions = new PrismaVersionRepository(this.prisma);
    const assets = new PrismaAssetRepository(this.prisma);

    try {
      const project = await projects.create({
        name: this.projectName,
        slug: this.projectSlug,
      });
      report.projectId = project.id;

      let pageId: string | null = null;
      const draft = snapshot.draft;
      if (draft === undefined || draft === null) {
        report.warnings.push("No draft provided (exacty-cms-draft). Page created empty.");
        const page = await pages.create({
          projectId: project.id,
          name: this.pageName,
          slug: this.pageSlug,
          content: {},
        });
        pageId = page.id;
        report.pagesCreated += 1;
      } else if (!isPlainObject(draft) && !Array.isArray(draft)) {
        report.errors.push("Draft JSON is invalid (expected object). Skipped Page.content.");
        const page = await pages.create({
          projectId: project.id,
          name: this.pageName,
          slug: this.pageSlug,
          content: {},
        });
        pageId = page.id;
        report.pagesCreated += 1;
      } else {
        const page = await pages.create({
          projectId: project.id,
          name: this.pageName,
          slug: this.pageSlug,
          content: draft,
        });
        pageId = page.id;
        report.pagesCreated += 1;

        await versions.create({
          projectId: project.id,
          pageId: page.id,
          status: "draft",
          label: "Migrated from exacty-cms-draft",
          content: draft,
        });
        report.versionsCreated += 1;
      }

      const published = snapshot.published;
      if (published === undefined || published === null) {
        report.warnings.push("No published snapshot (exacty-cms-published).");
      } else if (!isPlainObject(published) || typeof published.html !== "string") {
        report.errors.push(
          "Published JSON is invalid (expected { html, css?, updatedAt? }). Skipped published Version.",
        );
      } else {
        await versions.create({
          projectId: project.id,
          pageId,
          status: "published",
          label: "Migrated from exacty-cms-published",
          content: {
            html: published.html,
            css: typeof published.css === "string" ? published.css : "",
            updatedAt:
              typeof published.updatedAt === "string"
                ? published.updatedAt
                : new Date().toISOString(),
          },
        });
        report.versionsCreated += 1;
      }

      const media = snapshot.mediaAssets;
      if (media === undefined || media === null) {
        report.warnings.push("No media assets (exacty-cms-media-assets).");
      } else if (!Array.isArray(media)) {
        report.errors.push("Media assets JSON is invalid (expected array).");
      } else {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
        for (const [index, row] of media.entries()) {
          if (!isPlainObject(row)) {
            report.assetsSkippedInvalid += 1;
            report.warnings.push(`Asset #${index} skipped: not an object.`);
            continue;
          }
          const type = String(row.type || "file");
          const name = row.name ? String(row.name) : null;
          const src = row.src ? String(row.src) : "";
          if (!src) {
            report.assetsSkippedInvalid += 1;
            report.warnings.push(`Asset #${index} skipped: missing src.`);
            continue;
          }

          let url = src;
          let storagePath: string | null = null;
          let mimeType: string | null = null;
          let sizeBytes: number | null = null;

          if (src.startsWith("data:")) {
            const parsed = parseDataUrl(src);
            if (!parsed) {
              report.assetsSkippedInvalid += 1;
              report.warnings.push(`Asset #${index} skipped: invalid data URL.`);
              continue;
            }
            mimeType = parsed.mime;
            sizeBytes = parsed.buffer.length;
            const ext = extFromMime(parsed.mime);
            const safeName = (name || `asset-${index}`).replace(/[^\w.-]+/g, "_");
            const filename = `${randomUUID()}-${safeName}.${ext}`;
            storagePath = path.join("uploads", filename);
            const abs = path.join(this.uploadsDir, filename);
            fs.writeFileSync(abs, parsed.buffer);
            url = `/uploads/${filename}`;
            report.assetsSkippedBase64Extracted += 1;
          }

          await assets.create({
            projectId: project.id,
            type,
            name,
            url,
            storagePath,
            mimeType,
            sizeBytes,
            metadata: {
              migratedFrom: "exacty-cms-media-assets",
              originalHadDataUrl: src.startsWith("data:"),
            },
          });
          report.assetsCreated += 1;
        }
      }

      report.ok = report.errors.length === 0;
    } catch (error) {
      report.errors.push(error instanceof Error ? error.message : String(error));
      report.ok = false;
    }

    report.finishedAt = new Date().toISOString();
    return report;
  }

  static formatMarkdownReport(report: MigrationReport): string {
    const lines = [
      "# Migration Report",
      "",
      `Started: ${report.startedAt}`,
      `Finished: ${report.finishedAt ?? "—"}`,
      `OK: ${report.ok ? "yes" : "no"}`,
      "",
      "## Summary",
      "",
      `| Metric | Count |`,
      `|---|---|`,
      `| Project slug | \`${report.projectSlug}\` |`,
      `| Project id | \`${report.projectId ?? "—"}\` |`,
      `| Pages created | ${report.pagesCreated} |`,
      `| Versions created | ${report.versionsCreated} |`,
      `| Assets created | ${report.assetsCreated} |`,
      `| Base64 extracted to files | ${report.assetsSkippedBase64Extracted} |`,
      `| Assets skipped (invalid) | ${report.assetsSkippedInvalid} |`,
      "",
      "## Warnings",
      "",
      ...(report.warnings.length
        ? report.warnings.map((w) => `- ${w}`)
        : ["- None"]),
      "",
      "## Errors",
      "",
      ...(report.errors.length ? report.errors.map((e) => `- ${e}`) : ["- None"]),
      "",
      "## Notes",
      "",
      "- Frontend provider remains `local` by default.",
      "- `StorageEntry` and browser localStorage were not deleted.",
      "- Base64 media was written under `server/uploads/` when present.",
      "",
    ];
    return lines.join("\n");
  }
}
