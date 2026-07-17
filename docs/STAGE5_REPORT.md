# Stage 5 Report — API Provider Activation

## Summary

Controlled activation of `ApiStorageRepository` for **test** environments only.
Default `npm run dev` remains on `LocalStorageRepository`. Rollback via
`STORAGE_PROVIDER_FALLBACK` is available. Browser localStorage was **not** removed.

## What changed

| Area | Change |
|------|--------|
| Feature flag | `.env.api` sets `STORAGE_PROVIDER=api` for `vite --mode api` |
| Fallback | `FallbackStorageRepository` when `STORAGE_PROVIDER_FALLBACK=true` |
| Seed | `npm run seed:kv-from-domain` copies Page/Version/Asset → `StorageEntry` keys |
| Scripts | `dev:cms-api`, `seed:kv-from-domain`, `test:playwright:api` |
| Tests | `provider.api.integration.test.ts`, fallback unit tests, Playwright API smoke |
| Docs | `COMPATIBILITY_BASELINE.md` Etapa 5 |

## What did **not** change

- GrapesJS / Editor UI / Publish pipeline code paths
- `LocalStorageRepository` (kept)
- Browser localStorage contents (not deleted)
- Default provider for normal `dev` (`local`)

## Data path (API mode)

```
Editor Save/Publish
  → ApiStorageRepository
  → HttpKeyValueStorage (/api/storage/:key)
  → Express
  → SqliteStorageRepository
  → StorageEntry (SQLite)
```

Domain tables (`Project` / `Page` / `Version` / `Asset`) remain the Stage 4 migration
target; `seed:kv-from-domain` bridges them into the KV keys the CMS already uses.

## Rollback

1. Stop `dev:cms-api`, use `npm run dev` (`local`).
2. Or keep `api` with `STORAGE_PROVIDER_FALLBACK=true` — on API errors the CMS
   continues via `LocalStorageRepository` and logs `[cms-storage-fallback]`.

## Validation results

| Check | Result |
|-------|--------|
| `npm run test:api` | PASS (19) |
| `npm run test` | PASS (29) |
| Playwright baseline | PASS (7/7) |
| Playwright API smoke | PASS (3/3) |
| `npm run build` | PASS |
| Seed KV from domain | PASS (draft + published + 2 assets) |
| Default provider | still `local` |
| localStorage removed | No |

## Next (requires explicit approval)

- Make `api` the default provider
- Persist Salvar/Publicar into `Version` rows (domain), not only KV
- Eventually remove localStorage (explicit approval)
