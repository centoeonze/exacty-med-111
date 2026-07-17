/**
 * Local auth provider — no /api/auth calls; session in sessionStorage.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("cmsAuthApi local provider", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_CMS_AUTH_PROVIDER", "local");
    vi.stubEnv("VITE_CMS_USERNAME", "admin");
    vi.stubEnv("VITE_CMS_PASSWORD", "secret");
    sessionStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
    vi.resetModules();
  });

  it("login succeeds and creates a local session without fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { loginCms, fetchCmsSession, resolveCmsAuthProvider } = await import(
      "@/cms/auth/cmsAuthApi"
    );

    expect(resolveCmsAuthProvider()).toBe("local");
    const result = await loginCms("admin", "secret");
    expect(result).toEqual({ ok: true });
    expect(fetchSpy).not.toHaveBeenCalled();

    const session = await fetchCmsSession();
    expect(session.authenticated).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("login fails with wrong password and does not call API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { loginCms, fetchCmsSession } = await import("@/cms/auth/cmsAuthApi");

    const result = await loginCms("admin", "wrong");
    expect(result.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect((await fetchCmsSession()).authenticated).toBe(false);
  });

  it("logout clears local session without API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { loginCms, logoutCms, fetchCmsSession } = await import("@/cms/auth/cmsAuthApi");

    await loginCms("admin", "secret");
    await logoutCms();
    expect((await fetchCmsSession()).authenticated).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
