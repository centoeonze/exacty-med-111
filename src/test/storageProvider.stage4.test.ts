import { describe, expect, it } from "vitest";
import {
  createStorageRepository,
  resolveCmsStorageProviderFrom,
} from "@/cms/repositories";
import { ApiStorageRepository } from "@/cms/repositories/ApiStorageRepository";
import { LocalStorageRepository } from "@/cms/repositories/LocalStorageRepository";

describe("storage provider (local | api)", () => {
  it("defaults to local; resolves api only when explicitly set", () => {
    expect(resolveCmsStorageProviderFrom(undefined)).toBe("local");
    expect(resolveCmsStorageProviderFrom("")).toBe("local");
    expect(resolveCmsStorageProviderFrom("local")).toBe("local");
    expect(resolveCmsStorageProviderFrom("memory")).toBe("local");
    expect(resolveCmsStorageProviderFrom("api")).toBe("api");
  });

  it("factory returns LocalStorageRepository or ApiStorageRepository", () => {
    expect(createStorageRepository("local")).toBeInstanceOf(LocalStorageRepository);
    expect(createStorageRepository("api")).toBeInstanceOf(ApiStorageRepository);
  });
});
