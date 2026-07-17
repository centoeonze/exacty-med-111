import { describe, expect, it } from "vitest";
import {
  createStorageRepository,
  resolveCmsStorageProviderFrom,
} from "@/cms/repositories";
import { ApiStorageRepository } from "@/cms/repositories/ApiStorageRepository";

describe("storage provider (Stage 10A — API only)", () => {
  it("ignores local/legacy env values and resolves api", () => {
    expect(resolveCmsStorageProviderFrom(undefined)).toBe("api");
    expect(resolveCmsStorageProviderFrom("")).toBe("api");
    expect(resolveCmsStorageProviderFrom("local")).toBe("api");
    expect(resolveCmsStorageProviderFrom("memory")).toBe("api");
    expect(resolveCmsStorageProviderFrom("api")).toBe("api");
  });

  it("factory always returns ApiStorageRepository", () => {
    expect(createStorageRepository()).toBeInstanceOf(ApiStorageRepository);
  });
});
