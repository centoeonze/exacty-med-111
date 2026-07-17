# Stage 7 Report — API as Default Provider

## Summary

`STORAGE_PROVIDER` default is now **`api`**.  
`LocalStorageRepository` is **not removed** — it remains a temporary fallback when the API fails.  
Legacy browser keys are **monitored** (read-only) and never deleted by this stage.

## Changes

| Area | Change |
|------|--------|
| Default resolve | unset / empty / unknown → `api`; only explicit `local` → local |
| `.env` / `.env.example` | `STORAGE_PROVIDER=api` + fallback `true` |
| Fallback default | ON when fallback env unset |
| `LegacyStorageInspector` | Detect keys; warn `Legacy storage detected / migration required` |
| Fallback metrics | `total` / `byOperation` / `byKey` / `byReason` |
| Tests | `provider.default.api.test.ts`, legacy + metrics tests |
| Docs | This file + `LEGACY_STORAGE_REPORT.md` + baseline Etapa 7 |

## What was not done

- LocalStorage / `LocalStorageRepository` **not** removed
- Legacy keys **not** deleted
- GrapesJS / UI / Publish pipeline **not** rewritten

## Validation results

| Check | Result |
|-------|--------|
| `npm run test` | PASS (40) |
| `npm run test:api` | PASS (19) |
| Playwright API provider | PASS (5/5) |
| Playwright baseline (API default) | PASS (7/7) |
| `npm run build` | PASS |

## Rollback

```bash
# .env
STORAGE_PROVIDER=local
VITE_CMS_STORAGE_PROVIDER=local
```

## Next (explicit approval required)

- Remove localStorage residual / `LocalStorageRepository`
- Optional: one-click migrate legacy → API
- Wire domain `Version` UI
