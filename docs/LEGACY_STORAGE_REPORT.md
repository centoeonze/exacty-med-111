# Legacy Storage Report

> Generated / documented for **Stage 7**.  
> The CMS runs `LegacyStorageInspector` at editor boot (read-only).  
> This file describes the contract; browser console shows live warnings.

## Policy

- **Never** overwrite or delete browser `localStorage` from the inspector.
- `LocalStorageRepository` remains available as **API fallback only**.
- Removal of legacy storage requires **explicit approval** (future stage).

## Warning (when legacy keys exist)

```
Legacy storage detected
migration required
```

## Keys monitored

| Key | Role |
|-----|------|
| `exacty-cms-draft` | GrapesJS draft project |
| `exacty-cms-published` | Published HTML/CSS snapshot |
| `exacty-cms-media-assets` | PDF/image library rows |

## How to inspect in the browser

1. Open CMS (`/admin`) with `STORAGE_PROVIDER=api` (default).
2. Open DevTools console — if legacy keys exist, the warning above is logged.
3. Inspect `window.__CMS_LEGACY_STORAGE__` for the structured report.
4. Inspect `window.__CMS_FALLBACK_METRICS__` for fallback counters.

## Last automated unit snapshot

Unit tests in `src/test/legacyStorage.stage7.test.ts` validate:

- empty keys → no warning
- present keys → warning text + no mutation
- markdown formatter includes key table

## Migration note

If API/SQLite already has draft/published (via seed or prior saves), the editor uses API data.  
Legacy localStorage copies are left intact until an approved cleanup stage.
