# Stage 8 Report — Assets, Uploads & Persistent Auth Prep

## Summary

Server-side **Asset upload pipeline** and **User** model are ready for production-shaped
persistence. GrapesJS / CMS UI / login frontend were **not** changed. LocalStorage
fallback remains available.

## Assets

| Item | Status |
|------|--------|
| Audit | `docs/ASSET_STORAGE_AUDIT.md` |
| `AssetService` | upload / get / delete / validation |
| Endpoints | `POST /api/assets/upload`, `GET /api/assets/:id`, `DELETE /api/assets/:id` |
| Static files | `GET /uploads/<file>` (+ Vite proxy) |
| DB fields | `url`, `storagePath`, `mimeType`, `sizeBytes` — **no base64 in DB** |
| Frontend mediaManager | Still base64 → KV (wiring deferred; no UI change) |

### Storage strategy

```
CMS (future) → POST /api/assets/upload
            → filesystem server/uploads/
            → Prisma Asset (metadata)
            → url: /uploads/<uuid>-name.ext
```

## Auth prep

| Item | Status |
|------|--------|
| `User.role` | Added (`editor` default) |
| `passwordHash` / `updatedAt` | Present |
| `PrismaUserRepository` | create / findByEmail / update |
| Frontend login | Still Vite plugin + `.env` credentials |

## What was not done

- LocalStorage / fallback **not** removed
- GrapesJS / editor upload UI **not** switched to API
- Login frontend **not** migrated to DB users

## Validation results

| Check | Result |
|-------|--------|
| `npm run test` | PASS (40) |
| `npm run test:api` | PASS (25) |
| Playwright API provider | PASS (5/5) |
| Playwright baseline | PASS (7/7) |
| `npm run build` | PASS |

## Pendências finais (aprovação explícita)

1. Wire `mediaManager.uploadFile` → `/api/assets/upload`
2. Migrate CMS auth to Express + `User` + bcrypt/session
3. Remove LocalStorage residual (Stage cleanup)
4. Optional object storage / CDN for uploads
