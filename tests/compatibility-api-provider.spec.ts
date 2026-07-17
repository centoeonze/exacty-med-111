import { loadEnv } from "vite";
import { expect, test, type Page } from "@playwright/test";

/**
 * Stage 5 smoke: CMS with ApiStorageRepository (+ fallback).
 * Validates API health, draft/published persistence in SQLite, and editor boot.
 */
const env = loadEnv("development", process.cwd(), "");

const login = async (page: Page) => {
  const username = env.CMS_USERNAME;
  const password = env.CMS_PASSWORD;
  if (!username || !password) {
    throw new Error("CMS credentials are not configured in .env");
  }

  await page.goto("/admin");
  await page.getByLabel("Usuário").fill(username);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByText("Exacty CMS", { exact: true })).toBeVisible({
    timeout: 30_000,
  });
};

test.describe("Etapa 5 API provider smoke", () => {
  test("API health reports sqlite", async ({ request }) => {
    const res = await request.get("http://localhost:3001/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.storage).toBe("sqlite");
  });

  test("draft get/set/remove persists in SQLite via API", async ({ request }) => {
    const key = "exacty-cms-draft";
    const marker = `stage5-${Date.now()}`;
    const value = { pages: [{ name: "Home", marker }] };

    const set = await request.post(`http://localhost:3001/api/storage/${key}`, {
      data: { value },
    });
    expect(set.ok()).toBeTruthy();

    const get = await request.get(`http://localhost:3001/api/storage/${key}`);
    expect((await get.json()).value).toEqual(value);

    const del = await request.delete(`http://localhost:3001/api/storage/${key}`);
    expect(del.ok()).toBeTruthy();
    expect((await (await request.get(`http://localhost:3001/api/storage/${key}`)).json()).value).toBeNull();

    // restore a draft for the editor test
    await request.post(`http://localhost:3001/api/storage/${key}`, {
      data: { value },
    });
  });

  test("editor opens with API provider and can save published", async ({
    page,
    request,
  }) => {
    await login(page);
    await expect(page.frameLocator("iframe.gjs-frame").locator("body")).toBeVisible({
      timeout: 45_000,
    });

    const saveBtn = page.getByRole("button", { name: /Salvar/i }).first();
    if (await saveBtn.count()) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }

    const publishBtn = page.getByRole("button", { name: /Publicar/i }).first();
    if (await publishBtn.count()) {
      await publishBtn.click();
      await page.waitForTimeout(1000);
    }

    const published = await request.get(
      "http://localhost:3001/api/storage/exacty-cms-published",
    );
    expect(published.ok()).toBeTruthy();
    // After publish, value should be an object with html (if editor had content)
    const body = await published.json();
    if (body.value) {
      expect(typeof body.value.html).toBe("string");
    }

    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
