/**
 * CLI: migrate a localStorage snapshot JSON into Prisma CMS entities.
 *
 * Usage:
 *   npm run migrate:local-storage -- --file ./path/to/snapshot.json
 *
 * Snapshot shape:
 * {
 *   "draft": { ... GrapesJS project ... },
 *   "published": { "html": "...", "css": "...", "updatedAt": "..." },
 *   "mediaAssets": [{ "type": "pdf", "src": "...", "name": "..." }]
 * }
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LocalStorageMigrationService } from "../services/LocalStorageMigrationService.js";
import { getPrismaClient } from "../repositories/SqliteStorageRepository.js";
import { SqliteStorageRepository } from "../repositories/SqliteStorageRepository.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const getArg = (name: string) => {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
};

const hasFlag = (name: string) => process.argv.includes(name);

async function loadSnapshot() {
  const file = getArg("--file");
  if (file) {
    const abs = path.resolve(process.cwd(), file);
    const raw = fs.readFileSync(abs, "utf8");
    return JSON.parse(raw) as {
      draft?: unknown;
      published?: unknown;
      mediaAssets?: unknown;
    };
  }

  if (hasFlag("--from-storage-entry")) {
    const kv = new SqliteStorageRepository();
    return {
      draft: await kv.get("exacty-cms-draft"),
      published: await kv.get("exacty-cms-published"),
      mediaAssets: await kv.get("exacty-cms-media-assets"),
    };
  }

  throw new Error(
    "Provide --file <snapshot.json> or --from-storage-entry (reads KV StorageEntry keys).",
  );
}

async function main() {
  const snapshot = await loadSnapshot();
  const reportPath =
    getArg("--report") ??
    path.resolve(__dirname, "../../../docs/MIGRATION_REPORT.md");

  const service = new LocalStorageMigrationService({
    uploadsDir: path.resolve(process.cwd(), "uploads"),
  });
  const report = await service.migrate(snapshot);
  const markdown = LocalStorageMigrationService.formatMarkdownReport(report);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, markdown, "utf8");

  console.log(markdown);
  console.log(`\nReport written to ${reportPath}`);

  await getPrismaClient().$disconnect();
  process.exit(report.ok ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await getPrismaClient().$disconnect();
  process.exit(1);
});
