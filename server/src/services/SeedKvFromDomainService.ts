/**
 * Copies migrated domain entities (Page / Version / Asset) into StorageEntry KV keys
 * so ApiStorageRepository can serve the same shapes the CMS already expects.
 */
import {
  PrismaAssetRepository,
  PrismaPageRepository,
  PrismaVersionRepository,
} from "../repositories/prismaCmsRepositories.js";
import { SqliteStorageRepository } from "../repositories/SqliteStorageRepository.js";
import type { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "../repositories/SqliteStorageRepository.js";

export const DRAFT_KEY = "exacty-cms-draft";
export const PUBLISHED_KEY = "exacty-cms-published";
export const MEDIA_ASSETS_KEY = "exacty-cms-media-assets";

export type SeedKvReport = {
  projectId: string;
  draftSeeded: boolean;
  publishedSeeded: boolean;
  assetsSeeded: number;
  ok: boolean;
  warnings: string[];
};

export class SeedKvFromDomainService {
  constructor(
    private readonly prisma: PrismaClient = getPrismaClient(),
    private readonly kv = new SqliteStorageRepository(prisma),
  ) {}

  async seedLatestMigratedProject(): Promise<SeedKvReport> {
    const projects = await this.prisma.project.findMany({
      where: { slug: { startsWith: "cms-migrated-" } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { assets: true, pages: true, versions: true } } },
    });
    // Prefer a migration with assets (real Stage 4 sample) over empty test fixtures.
    const project =
      projects.find((p) => p._count.assets > 0) ??
      projects.find((p) => p._count.pages > 0) ??
      projects[0];
    if (!project) {
      return {
        projectId: "",
        draftSeeded: false,
        publishedSeeded: false,
        assetsSeeded: 0,
        ok: false,
        warnings: ["No cms-migrated-* project found."],
      };
    }
    return this.seedProject(project.id);
  }

  async seedProject(projectId: string): Promise<SeedKvReport> {
    const warnings: string[] = [];
    const pages = new PrismaPageRepository(this.prisma);
    const versions = new PrismaVersionRepository(this.prisma);
    const assets = new PrismaAssetRepository(this.prisma);

    const pageList = await pages.listByProject(projectId);
    const page = pageList[0];
    let draftSeeded = false;
    let publishedSeeded = false;
    let assetsSeeded = 0;

    if (!page) {
      warnings.push("Project has no pages.");
    } else {
      const draftContent = page.content ?? {};
      await this.kv.set(DRAFT_KEY, draftContent);
      draftSeeded = true;
    }

    const publishedVersions = await versions.listByProject(projectId, "published");
    const published = publishedVersions[0];
    if (!published) {
      warnings.push("No published Version found.");
    } else {
      await this.kv.set(PUBLISHED_KEY, published.content);
      publishedSeeded = true;
    }

    const assetRows = await assets.listByProject(projectId);
    const media = assetRows.map((a) => ({
      type: a.type,
      name: a.name,
      src: a.url,
    }));
    await this.kv.set(MEDIA_ASSETS_KEY, media);
    assetsSeeded = media.length;

    return {
      projectId,
      draftSeeded,
      publishedSeeded,
      assetsSeeded,
      ok: draftSeeded || publishedSeeded || assetsSeeded > 0,
      warnings,
    };
  }
}
