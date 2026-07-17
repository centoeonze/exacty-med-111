/**
 * Prisma implementations (Stage 3 — structure ready, no CMS migration yet).
 * Methods are usable for schema smoke tests; frontend does not call them yet.
 */
import type { PrismaClient } from "@prisma/client";
import type {
  CreateProjectInput,
  IProjectRepository,
  ProjectRecord,
  UpdateProjectInput,
} from "./ProjectRepository.js";
import type {
  CreatePageInput,
  IPageRepository,
  PageRecord,
  UpdatePageInput,
} from "./PageRepository.js";
import type {
  CreateVersionInput,
  IVersionRepository,
  VersionRecord,
} from "./VersionRepository.js";
import type {
  CreateAssetInput,
  IAssetRepository,
  AssetRecord,
  UpdateAssetInput,
} from "./AssetRepository.js";
import type {
  CreateUserInput,
  IUserRepository,
  UpdateUserInput,
  UserRecord,
} from "./UserRepository.js";
import { getPrismaClient } from "./SqliteStorageRepository.js";

export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  findById(id: string) {
    return this.prisma.project.findUnique({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.prisma.project.findUnique({ where: { slug } });
  }

  create(data: CreateProjectInput) {
    return this.prisma.project.create({ data });
  }

  update(id: string, data: UpdateProjectInput) {
    return this.prisma.project.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.project.delete({ where: { id } });
  }

  list() {
    return this.prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  }
}

export class PrismaPageRepository implements IPageRepository {
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  findById(id: string) {
    return this.prisma.page.findUnique({ where: { id } });
  }

  findByProjectAndSlug(projectId: string, slug: string) {
    return this.prisma.page.findUnique({
      where: { projectId_slug: { projectId, slug } },
    });
  }

  create(data: CreatePageInput) {
    return this.prisma.page.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        slug: data.slug,
        content: data.content ?? undefined,
      },
    });
  }

  update(id: string, data: UpdatePageInput) {
    return this.prisma.page.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        content: data.content === null ? undefined : data.content,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.page.delete({ where: { id } });
  }

  listByProject(projectId: string) {
    return this.prisma.page.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
    });
  }
}

export class PrismaVersionRepository implements IVersionRepository {
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  findById(id: string) {
    return this.prisma.version.findUnique({ where: { id } });
  }

  create(data: CreateVersionInput) {
    return this.prisma.version.create({
      data: {
        projectId: data.projectId,
        pageId: data.pageId ?? null,
        status: data.status,
        label: data.label ?? null,
        content: data.content as object,
      },
    });
  }

  listByProject(projectId: string, status?: string) {
    return this.prisma.version.findMany({
      where: { projectId, ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }

  async delete(id: string) {
    await this.prisma.version.delete({ where: { id } });
  }
}

export class PrismaAssetRepository implements IAssetRepository {
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  findById(id: string) {
    return this.prisma.asset.findUnique({ where: { id } });
  }

  create(data: CreateAssetInput) {
    return this.prisma.asset.create({
      data: {
        projectId: data.projectId,
        type: data.type,
        url: data.url,
        name: data.name ?? null,
        storagePath: data.storagePath ?? null,
        mimeType: data.mimeType ?? null,
        sizeBytes: data.sizeBytes ?? null,
        metadata: data.metadata === undefined ? undefined : (data.metadata as object),
      },
    });
  }

  update(id: string, data: UpdateAssetInput) {
    return this.prisma.asset.update({
      where: { id },
      data: {
        type: data.type,
        url: data.url,
        name: data.name,
        storagePath: data.storagePath,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        metadata: data.metadata === undefined ? undefined : (data.metadata as object),
      },
    });
  }

  async delete(id: string) {
    await this.prisma.asset.delete({ where: { id } });
  }

  listByProject(projectId: string, type?: string) {
    return this.prisma.asset.findMany({
      where: { projectId, ...(type ? { type } : {}) },
      orderBy: { createdAt: "desc" },
    });
  }
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: CreateUserInput) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username ?? null,
        passwordHash: data.passwordHash ?? null,
        role: data.role ?? "editor",
      },
    });
  }

  update(id: string, data: UpdateUserInput) {
    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        username: data.username,
        passwordHash: data.passwordHash,
        role: data.role === undefined ? undefined : data.role,
      },
    });
  }

  async delete(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}

// Silence unused type imports if tsc is strict about re-exports only
export type { ProjectRecord, PageRecord, VersionRecord, AssetRecord, UserRecord };
