/**
 * API provider harness for the shared IStorageRepository contract suite.
 * Uses an in-memory KV backend (same shape as Express MemoryStorageRepository)
 * so the suite stays network-free while proving ApiStorageRepository compatibility.
 */
import type { IStorageRepository } from "@/cms/repositories/IStorageRepository";
import { ApiStorageRepository } from "@/cms/repositories/ApiStorageRepository";
import { MemoryKeyValueStorage } from "@/cms/repositories/keyValueStorage";
import { runIStorageRepositoryContract } from "./storageContract";

const createRepositoryUnderTest = (): IStorageRepository =>
  new ApiStorageRepository(new MemoryKeyValueStorage());

runIStorageRepositoryContract(createRepositoryUnderTest, {
  label: "IStorageRepository contract (api provider / memory KV)",
});
