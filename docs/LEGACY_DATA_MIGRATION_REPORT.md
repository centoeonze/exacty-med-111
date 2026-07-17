# Legacy Data Migration Report

**Stage:** 9C Prep  
**Last execute:** 2026-07-17 (post-Playwright re-run)  
**Database:** `server/prisma/cms.db`  
**Command:** `npm run migrate:legacy-assets -- --report` / `--execute`

---

## Summary

| Metric | Value |
|--------|------:|
| Remaining `data:` URLs after execute | **0** |
| OK | true |

Embedded `data:` / base64 payloads in StorageEntry (and Page/Version JSON when present) are converted to files under `server/uploads/` with Prisma `Asset` metadata (`url`, `storagePath`, `mimeType`, `sizeBytes`). References are rewritten to `/uploads/...`.

---

## Audit sources

| Origin | What is scanned |
|--------|-----------------|
| `exacty-cms-media-assets` | Catalog rows with `src: data:...` |
| `exacty-cms-draft` | GrapesJS JSON with embedded images/PDFs |
| `exacty-cms-published` | Published HTML/CSS with `data:` refs |
| `Page.content` / `Version.content` | Domain snapshots (if any) |

Browser LocalStorage keys are **out of scope** (see `LegacyStorageInspector`).

---

## Observed runs

### Seeded demo payloads (PNG + PDF)

| Metric | Value |
|--------|------:|
| StorageEntry rows | 3 |
| Data URLs found | 6 |
| Approx bytes | 1575 |
| Unique files created | 2 |
| References updated | 7 |
| Remaining after execute | 0 |

### After Playwright e2e (upload fallback left 1 base64 catalog entry)

| Metric | Value |
|--------|------:|
| Data URLs (pre) | 3 |
| Unique files created | 1 |
| References updated | 4 |
| Remaining after execute | **0** |

> Playwright staging/baseline can still hit **legacy base64 upload fallback** when the Asset API path fails or is not used. Re-run `--execute` after e2e if audit shows remaining `data:` URLs. Etapa 10 removes that fallback.

### Earlier live snapshot (pre–test hygiene fix)

Before Storage API tests stopped calling `repository.clear()`, an audit saw 2× `application/pdf` in draft + published (~94 bytes each). Domain tables (`Page`/`Version`/`Asset`) were never wiped.

---

## How to run

```bash
npm run migrate:legacy-assets -- --report
npm run migrate:legacy-assets -- --execute
```

Optional demo seed:

```bash
npx tsx server/src/scripts/seed-legacy-data-urls.ts
```

---

## Out of scope (Etapa 10)

- LocalStorage fallback / LegacyInspector / Vite auth / legacy upload path / media KV removal
