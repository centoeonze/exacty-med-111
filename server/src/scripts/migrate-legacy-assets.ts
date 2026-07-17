/**
 * CLI: audit / migrate legacy data: URLs from StorageEntry (+ Page/Version) into Asset files.
 *
 * Modes:
 *   npm run migrate:legacy-assets -- --report
 *   npm run migrate:legacy-assets -- --execute
 *
 * Options:
 *   --report-out <path>   Write markdown report (default: docs/LEGACY_DATA_MIGRATION_REPORT.md)
 *   --uploads-dir <path>  Uploads directory (default: server/uploads)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "../..");
const repoRoot = path.resolve(serverRoot, "..");

// Ensure Prisma DATABASE_URL resolves against server/ (same as API process).
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(serverRoot, ".env"), override: true });
process.chdir(serverRoot);

// Prisma resolves relative sqlite paths from schema dir; keep explicit absolute URL.
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:./")) {
  process.env.DATABASE_URL = `file:${path.join(serverRoot, "prisma", "cms.db").replace(/\\/g, "/")}`;
}

import fs from "node:fs";
import { getPrismaClient } from "../repositories/SqliteStorageRepository.js";
import { LegacyAssetMigrationService } from "../services/LegacyAssetMigrationService.js";

const getArg = (name: string) => {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
};

const hasFlag = (name: string) => process.argv.includes(name);

async function main() {
  const executeMode = hasFlag("--execute") || hasFlag("--run");
  const reportFlag = hasFlag("--report");

  if (reportFlag && executeMode) {
    console.error("Use either --report or --execute, not both.");
    process.exit(2);
  }

  const uploadsDir =
    getArg("--uploads-dir") ?? path.join(serverRoot, "uploads");
  const reportOut =
    getArg("--report-out") ??
    path.join(repoRoot, "docs/LEGACY_DATA_MIGRATION_REPORT.md");

  const service = new LegacyAssetMigrationService({ uploadsDir });

  console.log(
    `[migrate:legacy-assets] mode=${executeMode ? "execute" : "report"} cwd=${process.cwd()} uploadsDir=${uploadsDir}`,
  );

  const result = await service.migrate({ dryRun: !executeMode });
  const markdown = executeMode
    ? LegacyAssetMigrationService.formatMigrationMarkdown(result)
    : LegacyAssetMigrationService.formatAuditMarkdown(result.audit);

  fs.mkdirSync(path.dirname(reportOut), { recursive: true });
  fs.writeFileSync(reportOut, markdown, "utf8");

  console.log(markdown);
  console.log(`\n[migrate:legacy-assets] report → ${reportOut}`);
  console.log(
    `[migrate:legacy-assets] converted=${result.converted} refs=${result.referencesUpdated} remaining=${result.remainingDataUrls} ok=${result.ok}`,
  );

  await getPrismaClient().$disconnect();
  process.exit(result.ok ? 0 : 1);
}

main().catch(async (error) => {
  console.error("[migrate:legacy-assets] failed:", error);
  try {
    await getPrismaClient().$disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
