import { describe, expect, it } from "vitest";
import {
  createStorageRepository,
  resolveCmsStorageProviderFrom,
} from "@/cms/repositories";
import { ApiStorageRepository } from "@/cms/repositories/ApiStorageRepository";
import { LocalStorageRepository } from "@/cms/repositories/LocalStorageRepository";

/**
 * Dual storage provider — local for static hosting, api when Express is up.
 */
describe("provider.default (local | api)", () => {
  it("defaults to local", () => {
    expect(resolveCmsStorageProviderFrom(undefined)).toBe("local");
    expect(resolveCmsStorageProviderFrom(null)).toBe("local");
    expect(resolveCmsStorageProviderFrom("")).toBe("local");
    expect(resolveCmsStorageProviderFrom("local")).toBe("local");
  });

  it("resolves api when requested", () => {
    expect(resolveCmsStorageProviderFrom("api")).toBe("api");
    expect(createStorageRepository("api")).toBeInstanceOf(ApiStorageRepository);
    expect(createStorageRepository("local")).toBeInstanceOf(LocalStorageRepository);
  });
});
