import { describe, expect, it, vi, afterEach } from "vitest";
import {
  resolveCmsAssetUploadMode,
  uploadCmsMediaFile,
} from "@/cms/mediaManager";

describe("cms asset upload (Stage 10A — API only)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("upload mode is always api", () => {
    expect(resolveCmsAssetUploadMode()).toBe("api");
  });

  it("uploadCmsMediaFile uses API response url without data: prefix", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          ok: true,
          asset: {
            id: "asset-1",
            url: "/uploads/asset-1-dot.png",
            name: "dot.png",
          },
        }),
      })),
    );

    const file = new File([new Uint8Array([1, 2, 3])], "dot.png", {
      type: "image/png",
    });
    const row = await uploadCmsMediaFile(file);
    expect(row.src).toBe("/uploads/asset-1-dot.png");
    expect(row.assetId).toBe("asset-1");
    expect(row.src.startsWith("data:")).toBe(false);
  });

  it("throws when API fails (no base64 fallback)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({ error: "boom" }),
      })),
    );

    const file = new File([new Uint8Array([1])], "x.png", { type: "image/png" });
    await expect(uploadCmsMediaFile(file)).rejects.toThrow(/boom|Upload failed/i);
  });
});
