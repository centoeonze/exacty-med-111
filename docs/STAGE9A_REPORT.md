# Stage 9A Report — Media Manager → Asset API + Auth Backend Prep

## Summary

Stage 9A connects the CMS Media Manager to `POST /api/assets/upload` and ships
Express auth (`/api/auth/*`) with bcrypt + HttpOnly session cookies, selectable via
`CMS_AUTH_PROVIDER`. GrapesJS UI, login layout, LocalStorage fallback, and
`LegacyStorageInspector` were **not** removed or redesigned.

**Etapa 9B (legacy removal) was not started.**

---

## 1. Files created / changed

### Media Manager

| File | Change |
|------|--------|
| `src/cms/mediaManager.ts` | `uploadCmsMediaFile` → API upload; KV index keeps `assetId`; DELETE remote on PDF remove; `VITE_CMS_ASSET_UPLOAD=api\|legacy` |
| `.env` / `.env.example` | `VITE_CMS_ASSET_UPLOAD=api` |

### Asset API (from Stage 8, used by CMS now)

| File | Role |
|------|------|
| `server/src/services/AssetService.ts` | Disk + Prisma Asset |
| `server/src/controllers/asset.controller.ts` | HTTP handlers |
| `server/src/routes/asset.routes.ts` | `POST /upload`, `GET/:id`, `DELETE/:id` |
| `server/src/app.ts` | Mounts `/api/assets` + `/uploads` |

### Auth API

| File | Change |
|------|--------|
| `server/src/services/AuthService.ts` | **Created** — bcrypt, session cookie, bootstrap user from env |
| `server/src/controllers/auth.controller.ts` | **Created** |
| `server/src/routes/auth.routes.ts` | **Created** — login / logout / me |
| `server/src/app.ts` | Mounts `/api/auth` + `cookie-parser` |
| `server/src/index.ts` | Loads repo `.env`, bootstraps User |
| `src/cms/auth/cmsAuthApi.ts` | Routes to vite or api via `CMS_AUTH_PROVIDER` |
| `src/cms/auth/CmsLoginPage.tsx` | **Unchanged layout** — still calls `loginCms()` |
| `vite-plugin-cms-auth.ts` | **Kept** for `CMS_AUTH_PROVIDER=vite` (default) |

### Tests

| File | Coverage |
|------|----------|
| `server/src/auth.stage9a.test.ts` | login valid/invalid, session, logout, hash |
| `server/src/asset.stage8.test.ts` | upload / get / delete (existing) |
| `src/test/assetUpload.stage9a.test.ts` | API url vs base64 fallback |
| `src/test/authProvider.stage9a.test.ts` | provider flag |

---

## 2. Flows implemented

### Upload (image / PDF)

```
Asset Manager uploadFile
  → uploadCmsMediaFile(file)
  → (mode=api) POST /api/assets/upload
  → AssetService → server/uploads + Asset row
  → returns { src: /uploads/..., assetId, name, type }
  → GrapesJS AssetManager + KV index (light: type/src/name/assetId)
```

- On API failure or `VITE_CMS_ASSET_UPLOAD=legacy` → base64 fallback (old assets still load).
- Pre-existing base64 catalog entries are **not** migrated/deleted.

### Exclusão de assets (PDF library)

```
deletePdfFromLibrary(src)
  → collect assetId from AssetManager + KV
  → remove from editor + update KV index
  → if assetId: DELETE /api/assets/:id
```

### Login / Logout / Sessão

| Provider | Endpoints | Credential store |
|----------|-----------|------------------|
| `vite` (default) | `/api/cms-auth/login\|logout\|session` | `.env` CMS_USERNAME/PASSWORD via Vite plugin |
| `api` | `/api/auth/login\|logout\|me` | Prisma `User` + bcrypt `passwordHash` + HttpOnly cookie |

Switch:

```bash
CMS_AUTH_PROVIDER=api
VITE_CMS_AUTH_PROVIDER=api
```

Server bootstraps admin user from `CMS_USERNAME`/`CMS_PASSWORD` (hashed) when missing.

---

## 3. Validations executed

| Command | Result |
|---------|--------|
| `npm run test:api` | **PASS — 29** |
| `npm run test` | **PASS — 45** |
| Playwright API provider | **PASS — 5/5** |
| Playwright baseline | **PASS — 7/7** |
| `npm run build` | **PASS** |

Playwright covered: login, PDF upload/library/delete, image upload, preview, publish.

---

## 4. Explicit confirmations (unchanged)

| Item | Status |
|------|--------|
| `LocalStorageRepository` | **Remains** |
| Storage `STORAGE_PROVIDER_FALLBACK` | **Remains** |
| `LegacyStorageInspector` | **Remains** |
| GrapesJS UI / blocks / panels | **Not redesigned** |
| Login page layout (`CmsLoginPage`) | **Not changed** |
| Legacy base64 assets | **Still load** |
| Etapa 9B (legacy removal) | **Not started** |

---

## 5. Remaining localStorage / legacy dependencies

- Fallback storage provider
- `LegacyStorageInspector` warnings
- KV catalog `exacty-cms-media-assets` (index; may still hold old base64 rows)
- Auth default still `vite` until you flip `CMS_AUTH_PROVIDER=api`
- Draft/published still via `StorageEntry` KV

---

## Rollback flags

```bash
# Assets → base64 only
VITE_CMS_ASSET_UPLOAD=legacy

# Auth → Vite plugin
CMS_AUTH_PROVIDER=vite
VITE_CMS_AUTH_PROVIDER=vite
```

---

## Next (only with explicit approval) — Etapa 9B

- Disable fallback / remove `LocalStorageRepository`
- Remove `LegacyStorageInspector` + old keys
- Clean legacy tests / docs
