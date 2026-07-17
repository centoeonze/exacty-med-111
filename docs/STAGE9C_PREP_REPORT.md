# Stage 9C Preparation Report — Legacy data migration before code cleanup

## Summary

Prep-only stage: **embedded `data:` / base64 payloads migrated** into `AssetService`
files + Prisma `Asset` rows, with references rewritten to `/uploads/...`.  
**No legacy code was removed** (LocalStorage, fallback, Vite auth, LegacyInspector stay).

---

## Deliverables

| Item | Status |
|------|--------|
| `docs/LEGACY_DATA_MIGRATION_REPORT.md` | ✅ |
| `server/src/services/LegacyAssetMigrationService.ts` | ✅ |
| `npm run migrate:legacy-assets` (`--report` / `--execute`) | ✅ |
| `server/src/legacyAssetMigration.test.ts` | ✅ |
| Storage tests no longer wipe entire KV (`clear()` removed from shared DB tests) | ✅ |

---

## Flow

```
Before                          After
──────                          ─────
StorageEntry                    AssetService
  data:image/...base64    →       uploads/<file>
  data:application/pdf…           Asset { url, storagePath, mimeType, sizeBytes }

References in:
  exacty-cms-draft
  exacty-cms-published
  exacty-cms-media-assets
  Page.content / Version.content
        ↓
  /uploads/...
```

---

## Migration run (execute)

| Metric | Value |
|--------|------:|
| Data URLs (pre) | 6 |
| Unique files created | 2 |
| References updated | 7 |
| Remaining data URLs | **0** |
| OK | true |

Commands:

```bash
npm run migrate:legacy-assets -- --report
npm run migrate:legacy-assets -- --execute
```

---

## Validation

| Check | Result |
|-------|--------|
| `npm run test:api` | PASS (32) |
| `npm run test` | PASS (45) |
| `legacyAssetMigration.test.ts` | PASS (base64 → Asset → refs) |
| Playwright staging (`test:playwright:api-provider`) | PASS (5/5) |
| Playwright baseline (`test:playwright:baseline`) | PASS (7/7) |
| `npm run build` | PASS |
| Post-migrate audit remaining `data:` | **0** (re-run `--execute` after Playwright) |
| LocalStorage / fallback / Vite auth removed? | **No** (deferred to Etapa 10) |

### New assets must not use `data:`

- `AssetService.assertNotEmbeddedPayload` still rejects `data:` / `blob:` on API upload.
- Migrated catalog `src` values are `/uploads/...` (+ optional `assetId`).

### Preview / publish

- Staging Playwright: editor preview, save, reload, publish — PASS.
- Baseline: home published + editor flows — PASS.
- Draft & published KV point at static `/uploads` after migration.

### Note on e2e + fallback

Playwright can still create catalog entries via **legacy base64 upload fallback**.  
After e2e, if `--report` shows remaining data URLs, run `--execute` again. Removing that fallback is Etapa 10.

---

## Explicitly NOT done (Etapa 10)

- ❌ Remove LocalStorage fallback  
- ❌ Remove LegacyStorageInspector  
- ❌ Remove Vite auth  
- ❌ Remove upload legacy / base64 fallback  
- ❌ Remove StorageEntry media KV  
- ❌ Dead-code purge  

---

## Next

**Etapa 10 — Limpeza definitiva** is now safe from a **data** perspective:  
legacy media no longer requires `data:` payloads in SQLite KV to render.
