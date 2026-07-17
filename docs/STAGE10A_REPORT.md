# Stage 10A Report — Legacy storage & auth removal

## Summary

Removed LocalStorage fallback, LegacyStorageInspector, Vite auth plugin, and
base64 upload fallback. **API is the only path** for storage, auth, and uploads.

GrapesJS UI, editor layout, and publish UX were not redesigned.

---

## Removed files

| File | Role |
|------|------|
| `src/cms/repositories/LocalStorageRepository.ts` | Browser KV provider |
| `src/cms/repositories/FallbackStorageRepository.ts` | API → local fallback wrapper |
| `src/cms/repositories/fallbackMetrics.ts` | `__CMS_FALLBACK_METRICS__` |
| `src/cms/repositories/storageFallbackLog.ts` | Fallback structured logs |
| `src/cms/repositories/uploadFallbackMetrics.ts` | `__CMS_UPLOAD_FALLBACK_METRICS__` |
| `src/cms/repositories/ShadowReadStorageRepository.ts` | Migration shadow-read |
| `src/cms/services/StorageComparisonService.ts` | Frontend shadow compare |
| `src/cms/services/LegacyStorageInspector.ts` | Runtime legacy probe |
| `vite-plugin-cms-auth.ts` | `/api/cms-auth/*` + env credentials |
| `src/test/legacyStorage.stage7.test.ts` | Inspector tests |
| `src/test/storageContract.local.test.ts` | LocalStorage contract tests |

---

## Removed / obsolete flags

| Flag | Status |
|------|--------|
| `STORAGE_PROVIDER_FALLBACK` / `VITE_STORAGE_PROVIDER_FALLBACK` | Removed |
| `CMS_AUTH_PROVIDER` / `VITE_CMS_AUTH_PROVIDER` | Removed (always API) |
| `VITE_CMS_ASSET_UPLOAD` (`api`\|`legacy`) | Removed (always API) |
| `CMS_STORAGE_SHADOW_READ` | Removed |

**Kept (Express bootstrap only):** `CMS_USERNAME` / `CMS_PASSWORD` — seed hashed
admin via `AuthService.ensureBootstrapUserFromEnv` + Playwright login. Not used by Vite.

---

## Architecture after 10A

```
CMS ──► /api/storage/*     ──► SqliteStorageRepository
CMS ──► /api/auth/*        ──► AuthService + User + bcrypt + HttpOnly cookie
CMS ──► /api/assets/upload ──► AssetService ──► uploads/ + Asset table
```

- `createStorageRepository()` → `ApiStorageRepository` only  
- `resolveCmsAuthProvider()` → `"api"`  
- `uploadCmsMediaFile()` → API only (throws on failure; no `readAsDataURL`)  
- Vite proxy: all `/api` → Express (no `/api/cms-auth` bypass)

---

## Tests updated

| Change |
|--------|
| `provider.default.api.test.ts` — API-only factory |
| `storageProvider.stage4.test.ts` — no local/fallback cases |
| `assetUpload.stage9a.test.ts` — no base64 fallback case |
| `authProvider.stage9a.test.ts` — always `api` |
| **Added** `legacyRemoval.guard.test.ts` |

---

## Validation

| Check | Result |
|-------|--------|
| `npm run test` | PASS (20) — includes `legacyRemoval.guard` |
| `npm run test:api` | PASS (32) |
| Playwright staging (`test:playwright:api-provider`) | PASS (5/5) |
| Playwright baseline (`test:playwright:baseline`) | PASS (7/7) |
| `npm run build` | PASS |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Express API down → CMS cannot save/load | Expected; no silent LocalStorage fallback. Run `npm run dev:api` with Vite. |
| Upload fails → user sees error | Expected; no base64 silent fallback. |
| Stale browser `localStorage` keys | Harmless; CMS no longer reads them. Clear manually if desired. |
| Auth requires API | Baseline Playwright already starts `dev:api`. |
| Credentials only in DB after first boot | Keep `CMS_USERNAME`/`CMS_PASSWORD` in `.env` for bootstrap / e2e. |

---

## Explicitly NOT in 10A (→ 10B)

- Drop / shrink unused `StorageEntry` media KV strategy documentation
- Final DB hygiene / docs cleanup
- Removing historical stage reports

---

## Next

**Etapa 10B** — limpeza final de banco e documentação.
