import { PrismaClient } from "@prisma/client";
import type { IStorageRepository } from "./IStorageRepository.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const getPrismaClient = (): PrismaClient => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
};

/**
 * SQLite-backed key/value storage via Prisma (Stage 2).
 * Values are stored as JSON strings in StorageEntry.value.
 */
export class SqliteStorageRepository implements IStorageRepository {
  constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

  async get<T = unknown>(key: string): Promise<T | null> {
    const row = await this.prisma.storageEntry.findUnique({ where: { key } });
    if (!row) return null;
    try {
      return JSON.parse(row.value) as T;
    } catch {
      return null;
    }
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.prisma.storageEntry.upsert({
      where: { key },
      create: { key, value: serialized },
      update: { value: serialized },
    });
  }

  async remove(key: string): Promise<void> {
    await this.prisma.storageEntry.deleteMany({ where: { key } });
  }

  async has(key: string): Promise<boolean> {
    const row = await this.prisma.storageEntry.findUnique({
      where: { key },
      select: { id: true },
    });
    return Boolean(row);
  }

  async clear(): Promise<void> {
    await this.prisma.storageEntry.deleteMany();
  }
}
