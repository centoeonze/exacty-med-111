# CMS Storage Inventory

Persistence is selected by `VITE_CMS_STORAGE_PROVIDER`:

| Mode | Adapter | Backend |
|------|---------|---------|
| `local` (default) | `LocalStorageRepository` | browser `localStorage` |
| `api` | `ApiStorageRepository` | Express `/api/storage/:key` → Prisma |

## Keys

| Key | Role |
|-----|------|
| `exacty-cms-draft` | Last **Draft** snapshot (Save). Preview / Publish source. |
| `exacty-cms-published` | Last **Published** snapshot (promote-only). Public Home. |
| `exacty-cms-media-assets` | Media catalog (PDFs/images metadata). |

## Draft shape (`exacty-cms-draft-v2`)

```json
{
  "kind": "exacty-cms-draft-v2",
  "versionId": "<uuid>",
  "updatedAt": "<iso>",
  "checksum": "c…",
  "project": { "...": "GrapesJS project JSON" },
  "html": "<serialized markup>",
  "css": "<site css + editor css>"
}
```

Legacy drafts may still be a raw GrapesJS project object. The editor unwraps them via `extractProjectFromStoredDraft`. Publish requires a v2 snapshot (user must Salvar once).

## Published shape (`exacty-cms-published-v2`)

```json
{
  "kind": "exacty-cms-published-v2",
  "versionId": "<same as promoted draft>",
  "publishedAt": "<iso>",
  "updatedAt": "<iso>",
  "checksum": "<same as promoted draft>",
  "html": "…",
  "css": "…"
}
```

Publish never re-serializes the editor: it copies the last Draft verbatim (`versionId` + `checksum` preserved).
