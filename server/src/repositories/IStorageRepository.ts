/**
 * Backend key-value storage contract.
 * Stage 2: SqliteStorageRepository (Prisma + SQLite)
 * MemoryStorageRepository remains available for isolated unit tests.
 */
export interface IStorageRepository {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;
}
