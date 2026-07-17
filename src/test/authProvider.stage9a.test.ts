import { describe, expect, it } from "vitest";
import { resolveCmsAuthProviderFrom } from "@/cms/auth/cmsAuthApi";

describe("cms auth provider (local | api)", () => {
  it("defaults to local when unset", () => {
    expect(resolveCmsAuthProviderFrom(undefined)).toBe("local");
    expect(resolveCmsAuthProviderFrom("")).toBe("local");
    expect(resolveCmsAuthProviderFrom("local")).toBe("local");
  });

  it("resolves api when value is api", () => {
    expect(resolveCmsAuthProviderFrom("api")).toBe("api");
    expect(resolveCmsAuthProviderFrom("API")).toBe("api");
  });
});
