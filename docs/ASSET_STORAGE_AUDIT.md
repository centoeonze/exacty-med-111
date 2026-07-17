# Asset Storage Audit (Stage 8)

## Summary

Today the CMS still embeds many media files as **data URLs (base64)** in the browser
catalog (`exacty-cms-media-assets` via `ApiStorageRepository` → `StorageEntry`).  
Stage 4+ domain model already defines `Asset` with `url` / `storagePath` / `mimeType` /
`sizeBytes` — Stage 8 adds the **server upload pipeline** so production can stop relying
on base64 blobs in JSON.

## Current origins (frontend)

| Type | How it enters CMS | Current persistence | Risk |
|------|-------------------|---------------------|------|
| Images (Asset Manager) | File picker → `readAsDataUrl` (`embedAsBase64: true`) | `exacty-cms-media-assets` KV + draft HTML `src` | Large JSON / SQLite bloat |
| PDFs (library / traits) | File picker → data URL | Same KV + component traits | Same |
| Static site PDFs | `public/regulatorio/*.pdf` | Bundled / public URLs | OK for shipping assets |
| Static images | `src/assets/*`, `public/*` | Vite build | OK |

Source of truth for CMS uploads today: `src/cms/mediaManager.ts`
(`uploadFile` → base64 → `persistMediaAssets`).

## Target model (Stage 8)

| Field | Purpose |
|-------|---------|
| `Asset.url` | Public URL (`/uploads/<file>`) |
| `Asset.storagePath` | Relative filesystem path under `server/uploads/` |
| `Asset.mimeType` | e.g. `image/png`, `application/pdf` |
| `Asset.sizeBytes` | File size |
| `Asset.type` | `image` \| `pdf` \| … |
| `Asset.name` | Original filename |

**Do not store:** base64, blob URLs, or binary payloads in `Page` / `Version` / KV JSON.

## Bank vs filesystem

```
Upload → POST /api/assets/upload
       → AssetService writes file to server/uploads/
       → Prisma Asset row (metadata only)
       → GET /uploads/<filename> (static)
```

## Size / location notes

| Location | Contents | Git |
|----------|----------|-----|
| `server/uploads/` | Runtime uploads | gitignored |
| `server/prisma/cms.db` | Asset metadata rows | gitignored |
| `public/regulatorio/` | Regulatory PDFs shipped with site | tracked |
| Browser / KV `exacty-cms-media-assets` | Legacy catalog (may still hold base64 until frontend switch) | n/a |

## Frontend wiring status

| Item | Status |
|------|--------|
| Backend AssetService + endpoints | Stage 8 |
| Static `/uploads` | Stage 8 |
| GrapesJS / mediaManager → API upload | **Pending** (no UI change in this stage) |
| LocalStorage fallback | Still available |

## Next (not Stage 8)

- Point `mediaManager.uploadFile` at `/api/assets/upload` (explicit UI/editor change approval)
- Strip remaining base64 from draft/published HTML
- CDN / object storage for production scale
