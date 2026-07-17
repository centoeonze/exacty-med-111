import { describe, expect, it } from "vitest";
import {
  createStorageRepository,
  resolveCmsStorageProvider,
  resolveCmsStorageProviderFrom,
} from "@/cms/repositories";
import { ApiStorageRepository } from "@/cms/repositories/ApiStorageRepository";

/**
 * Stage 10A — API is the only storage provider.
 */
describe("provider.default.api (Stage 10A)", () => {
  it("always resolves to api", () => {
    expect(resolveCmsStorageProviderFrom(undefined)).toBe("api");
    expect(resolveCmsStorageProviderFrom(null)).toBe("api");
    expect(resolveCmsStorageProviderFrom("")).toBe("api");
    expect(resolveCmsStorageProviderFrom("local")).toBe("api");
    expect(resolveCmsStorageProviderFrom("api")).toBe("api");
    expect(resolveCmsStorageProvider()).toBe("api");
  });

  it("createStorageRepository always returns ApiStorageRepository", () => {
    expect(createStorageRepository()).toBeInstanceOf(ApiStorageRepository);
    expect(createStorageRepository("api")).toBeInstanceOf(ApiStorageRepository);
  });
});
