# Legacy Usage Report (Stage 9B Preparation)

> Read-only monitoring before legacy removal.  
> **No code was deleted in this stage.**

Generated / maintained for Stage 9B prep. Live counters are available in the CMS
browser session after editor boot.

---

## How to read live metrics

Open CMS DevTools console after using the editor:

| Probe | Meaning |
|-------|---------|
| `window.__CMS_FALLBACK_METRICS__` | Storage API → LocalStorage fallbacks (`operation` / `key` / `reason`) |
| `window.__CMS_UPLOAD_FALLBACK_METRICS__` | Asset upload → base64 fallbacks |
| `window.__CMS_LEGACY_STORAGE__` | Browser localStorage keys still present (inspector) |
| `window.__CMS_STORAGE_PROVIDER__` | Active storage provider (`api` expected) |

---

## Categories monitored

### 1. Storage fallback

| Source | When it fires |
|--------|----------------|
| `FallbackStorageRepository` | `STORAGE_PROVIDER=api` and HTTP KV call throws |
| Log format | `Storage fallback:\noperation=…\nkey=…\nreason=…` |
| Metrics | `__CMS_FALLBACK_METRICS__.total` |

**Expected in healthy staging:** `total === 0` (API up).

### 2. Upload fallback

| Source | When it fires |
|--------|----------------|
| `uploadCmsMediaFile` | `VITE_CMS_ASSET_UPLOAD=api` and `POST /api/assets/upload` fails |
| Behavior | Falls back to `data:` base64 (legacy path) |
| Metrics | `__CMS_UPLOAD_FALLBACK_METRICS__.total` |

**Expected in healthy staging:** `total === 0`.

### 3. Legacy / old-path calls (still in codebase — not removed yet)

| Path | Status |
|------|--------|
| `LocalStorageRepository` | Active only as storage fallback target |
| `exacty-cms-media-assets` KV | Still used as **light index** (`type`/`src`/`name`/`assetId`) |
| `readAsDataUrl` / base64 upload | Rollback + automatic upload fallback only |
| `vite-plugin-cms-auth` | Active when `CMS_AUTH_PROVIDER=vite` (dev default); staging uses `api` |
| `LegacyStorageInspector` | Warns if browser still has old keys |

### 4. Base64 assets found

| Location | Notes |
|----------|-------|
| Browser `localStorage` keys | Detected by `LegacyStorageInspector` |
| KV `StorageEntry` `exacty-cms-media-assets` | May still contain historical `data:` rows |
| New uploads (API mode, healthy API) | Should be `/uploads/…` URLs, **not** base64 |

To sample KV without deleting:

```bash
# via API (dev)
curl http://localhost:3001/api/storage/exacty-cms-media-assets
```

Count entries where `src` starts with `data:` → legacy blobs still indexed.

---

## Snapshot (prep run)

| Metric | Value at prep | Notes |
|--------|---------------|-------|
| Storage fallback during Playwright staging | 0 (inferred — flows passed via API) | No forced API outage |
| Upload fallback during Playwright staging | 0 (inferred — PDF/image uploads passed) | |
| Auth provider in staging | `api` — **validated** (login/logout/me/route guard) | `.env.staging` |
| Auth provider in default `.env` | `vite` | Rollback for local day-to-day |
| test:api / test / Playwright / build | 29 / 45 / 5+7 / PASS | Prep gate green |

Update this table after a production-like soak if needed.

---

## Policy until Stage 9B removal

- Do **not** delete LocalStorage / fallback / Vite auth plugin yet.
- Prefer measuring `__CMS_*_METRICS__` over guessing.
- Only remove a path when metrics stay at 0 and “Pode remover” list is approved.
