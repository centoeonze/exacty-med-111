import { describe, expect, it } from "vitest";
import { resolveCmsAuthProvider } from "@/cms/auth/cmsAuthApi";

describe("cms auth provider (Stage 10A)", () => {
  it("resolveCmsAuthProvider is always api", () => {
    expect(resolveCmsAuthProvider()).toBe("api");
  });
});
