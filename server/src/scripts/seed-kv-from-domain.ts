/**
 * Seeds StorageEntry KV from the latest Stage 4 migrated Project
 * so ApiStorageRepository can load draft/published/assets.
 *
 * Usage: npm run seed:kv-from-domain
 */
import { SeedKvFromDomainService } from "../services/SeedKvFromDomainService.js";
import { getPrismaClient } from "../repositories/SqliteStorageRepository.js";

async function main() {
  const report = await new SeedKvFromDomainService().seedLatestMigratedProject();
  console.log(JSON.stringify(report, null, 2));
  await getPrismaClient().$disconnect();
  process.exit(report.ok ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await getPrismaClient().$disconnect();
  process.exit(1);
});
