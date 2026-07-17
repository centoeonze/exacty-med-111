# Stage 6 Report — API as Primary Provider (controlled / staging)

## Summary

API is the **primary** storage provider in the controlled staging environment
(`npm run dev:staging` → `.env.staging`).  
Local development (`npm run dev`) remains on `LocalStorageRepository`.  
`LocalStorageRepository` and browser localStorage are **preserved** as fallback —
not removed.

## Environment matrix

| Command | Mode file | `STORAGE_PROVIDER` | Fallback |
|---------|-----------|--------------------|----------|
| `npm run dev` | `.env` | `local` | n/a |
| `npm run dev:cms-api` | `.env.api` | `api` | `true` |
| `npm run dev:staging` | `.env.staging` | `api` (**primary**) | `true` |

## Flows validated (API / staging)

| Flow | Result | Notes |
|------|--------|-------|
| Login + provider probe `__CMS_STORAGE_PROVIDER__=api` | PASS | Confirms staging mode |
| Open editor / load page | PASS | Default Home when draft cleared |
| Preview | PASS | GrapesJS Preview command |
| Save draft | PASS | Persists `exacty-cms-draft` in SQLite |
| Reload recovers draft | PASS | Read from API/SQLite |
| Publish | PASS | Persists `exacty-cms-published` |
| Home published | PASS | `#hero`, `#produtos`, `#sobre` |
| Draft create/update/retrieve | PASS | Via Salvar + GET API |
| Versioning (draft + published keys) | PASS | CMS KV slots; domain `Version` UI unchanged |
| PDF upload / library / delete | PASS | Media via API catalog |
| Image upload (Asset Manager) | PASS | When AM input present |

## Fallback observability

On API failure, console logs:

```
Storage fallback:
operation=loadDraft
key=exacty-cms-draft
reason=API unavailable
```

Implemented in `storageFallbackLog.ts` + `FallbackStorageRepository`.  
Unit tests assert `operation` / `key` / `reason`.

## Divergences: API mode vs local baseline

| Topic | Local | Staging (API) | Divergence? |
|-------|-------|---------------|-------------|
| Provider | `LocalStorageRepository` | `ApiStorageRepository` (+ fallback) | Intentional |
| Persistence | browser localStorage | SQLite `StorageEntry` | Intentional |
| Editor / GrapesJS / UI | unchanged | unchanged | None |
| Publish pipeline code | unchanged | unchanged | None |
| Domain `Version` UI listing | n/a | n/a | Same — not wired to UI yet |
| Fallback | n/a | LocalStorage on API error | Extra safety in staging |

**Fallback used during Stage 6 E2E:** no (API healthy).  
**Fallback validated:** unit tests (forced API throw).

## What was not done

- LocalStorage / `LocalStorageRepository` **not** removed
- Default `npm run dev` **not** switched to `api`
- GrapesJS / UI / Publish pipeline **not** rewritten
- Old browser data **not** deleted

## Validation results

| Check | Result |
|-------|--------|
| `npm run test` | PASS (30) |
| `npm run test:api` | PASS (19) |
| Playwright baseline | PASS (7/7) |
| Playwright API provider staging | PASS (5/5) |
| `npm run build` | PASS |

## How to run staging

```bash
npm run dev:api
npm run dev:staging
# E2E:
npm run test:playwright:api-provider
```

## Next (explicit approval required)

- Promote `api` as default for `npm run dev`
- Wire Salvar/Publicar into domain `Version` rows (beyond KV)
- Remove localStorage residual (explicit approval)
