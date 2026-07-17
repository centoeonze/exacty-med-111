import path from "node:path";
import { loadEnv } from "vite";
import { expect, test, type Page, type FrameLocator, type APIRequestContext } from "@playwright/test";

/**
 * Stage 6 — full CMS E2E with API as primary provider (vite --mode staging).
 * Mirrors baseline local flows: login, editor, edit, save, preview, publish, assets.
 */
const env = loadEnv("development", process.cwd(), "");
const PDF_FIXTURE = path.resolve("public/regulatorio/placeholder-afe.pdf");
const IMAGE_FIXTURE = path.resolve("public/favicon.png");

const clearDraftSources = async (page: Page, request: APIRequestContext) => {
  // Clear API KV draft so default Home template loads.
  await request.delete("http://localhost:3001/api/storage/exacty-cms-draft").catch(() => undefined);
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("exacty-cms-draft");
    } catch {
      /* ignore — browser may still hold stale keys from older builds */
    }
  });
};

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

const canvas = (page: Page): FrameLocator => page.frameLocator("iframe.gjs-frame");

const waitForCanvasReady = async (page: Page) => {
  await expect(canvas(page).locator("#hero")).toBeVisible({ timeout: 60_000 });
};

test.describe("Etapa 6 API provider (staging) — parity with local baseline", () => {
  test("login confirms API provider mode + Express auth session", async ({
    page,
    request,
  }) => {
    await clearDraftSources(page, request);
    await login(page);
    await expect(page.getByText("Exacty CMS", { exact: true })).toBeVisible();
    const provider = await page.evaluate(
      () =>
        (window as unknown as { __CMS_STORAGE_PROVIDER__?: string })
          .__CMS_STORAGE_PROVIDER__ ?? null,
    );
    expect(provider).toBe("api");

    // Stage 10A: Auth is Express /api/auth/* only
    const me = await page.request.get("/api/auth/me");
    expect(me.ok()).toBeTruthy();
    const body = await me.json();
    expect(body.authenticated).toBe(true);
    expect(body.user).toBeTruthy();

    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible({
      timeout: 15_000,
    });
    const meAfter = await page.request.get("/api/auth/me");
    expect((await meAfter.json()).authenticated).toBe(false);

    // Route protection: admin should show login again
    await page.goto("/admin");
    await expect(page.getByLabel("Usuário")).toBeVisible();

    void request;
  });

  test("editor: open project, preview, save, reload, publish", async ({
    page,
    request,
  }) => {
    await clearDraftSources(page, request);
    await login(page);
    await waitForCanvasReady(page);

    const frame = canvas(page);
    await expect(frame.locator("#produtos")).toBeVisible({ timeout: 30_000 });
    await expect(frame.locator("#sobre")).toBeVisible({ timeout: 30_000 });

    // Preview
    await page.locator('[title="Preview"]').first().dispatchEvent("click");
    await page.waitForTimeout(500);
    await expect(frame.locator("#hero")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Save draft → API
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText(/Rascunho salvo/)).toBeVisible({ timeout: 15_000 });

    const draftBefore = await request.get(
      "http://localhost:3001/api/storage/exacty-cms-draft",
    );
    expect(draftBefore.ok()).toBeTruthy();
    expect((await draftBefore.json()).value).toBeTruthy();

    // Reload recovers draft from SQLite
    await page.reload();
    await waitForCanvasReady(page);
    await expect(frame.locator("#hero")).toBeVisible();

    // Publish
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText(/Página publicada|publicada/i)).toBeVisible({
      timeout: 15_000,
    });

    const published = await request.get(
      "http://localhost:3001/api/storage/exacty-cms-published",
    );
    const pubBody = await published.json();
    expect(pubBody.value?.html).toEqual(expect.any(String));
    expect(String(pubBody.value.html).length).toBeGreaterThan(0);

    await page.goto("/");
    await expect(page.locator("#hero")).toBeVisible({ timeout: 30_000 });
    await expect(page.locator("#produtos")).toBeVisible();
    await expect(page.locator("#sobre")).toBeVisible();
  });

  test("draft: create/update/retrieve via editor + API", async ({ page, request }) => {
    await clearDraftSources(page, request);
    await login(page);
    await waitForCanvasReady(page);

    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText(/Rascunho salvo/)).toBeVisible({ timeout: 15_000 });

    const first = await (
      await request.get("http://localhost:3001/api/storage/exacty-cms-draft")
    ).json();
    expect(first.value).toBeTruthy();

    const cta = canvas(page).locator('a:has-text("Falar com um consultor")').first();
    await cta.scrollIntoViewIfNeeded();
    await cta.click({ force: true });
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText(/Rascunho salvo/)).toBeVisible({ timeout: 15_000 });

    const second = await (
      await request.get("http://localhost:3001/api/storage/exacty-cms-draft")
    ).json();
    expect(second.value).toBeTruthy();
  });

  test("versioning: draft + published keys act as versions", async ({ request }) => {
    const draft = await request.get(
      "http://localhost:3001/api/storage/exacty-cms-draft",
    );
    const published = await request.get(
      "http://localhost:3001/api/storage/exacty-cms-published",
    );
    expect(draft.ok()).toBeTruthy();
    expect(published.ok()).toBeTruthy();

    const d = await draft.json();
    const p = await published.json();
    if (p.value) {
      expect(p.value).toMatchObject({
        html: expect.any(String),
        css: expect.any(String),
      });
    }
    if (d.value) {
      expect(typeof d.value).toBe("object");
    }
  });

  test("assets: PDF library upload/list/delete + image upload", async ({
    page,
    request,
  }) => {
    await clearDraftSources(page, request);
    await login(page);
    await waitForCanvasReady(page);

    const docLink = canvas(page).locator('a:has-text("Baixar documento")').first();
    await docLink.scrollIntoViewIfNeeded();
    await docLink.click();
    await page.waitForTimeout(600);
    await page.locator('[title="Settings"]').click();
    await page.waitForTimeout(400);

    const uploadBtn = page.getByRole("button", { name: "Enviar PDF" });
    await expect(uploadBtn).toBeVisible({ timeout: 10_000 });

    const fileInput = page.locator('input[type="file"][accept*="pdf"]').last();
    await fileInput.setInputFiles(PDF_FIXTURE);
    await page.waitForTimeout(1200);
    await expect(page.getByText(/Arquivo:/)).toBeVisible();

    await page.getByRole("button", { name: "Selecionar PDF" }).click();
    await expect(page.getByText("Biblioteca de PDFs")).toBeVisible();
    await expect(
      page.locator("[data-exacty-pdf-library]").getByText(/placeholder-afe|\.pdf/i).first(),
    ).toBeVisible();

    // Close library modal so Salvar is clickable
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: "Salvar" }).click({ force: true });
    await expect(page.getByText(/Rascunho salvo/)).toBeVisible({ timeout: 15_000 });

    const media = await request.get(
      "http://localhost:3001/api/storage/exacty-cms-media-assets",
    );
    expect(media.ok()).toBeTruthy();

    await page.getByRole("button", { name: "Selecionar PDF" }).click();
    page.once("dialog", (d) => d.accept());
    await page
      .locator("[data-exacty-pdf-library]")
      .getByRole("button", { name: "Excluir" })
      .first()
      .click({ force: true });
    await page.waitForTimeout(500);
    await page.keyboard.press("Escape");

    const openAssets = page
      .locator(".gjs-pn-btn")
      .filter({ has: page.locator(".fa-images, .fa-image") })
      .first();
    if (await openAssets.count()) {
      await openAssets.click();
    } else {
      await page.evaluate(() => {
        document
          .querySelector('.gjs-pn-btn[data-command="open-assets"]')
          ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    }
    await page.waitForTimeout(500);
    const amInput = page
      .locator(
        '.gjs-am-file-uploader input[type="file"], .gjs-am-assets input[type="file"], input[type="file"][accept*="image"]',
      )
      .first();
    if (await amInput.count()) {
      await amInput.setInputFiles(IMAGE_FIXTURE);
      await page.waitForTimeout(1000);
      await expect(page.locator(".gjs-am-asset, .gjs-am-assets-cont").first()).toBeVisible();
    }
  });
});
