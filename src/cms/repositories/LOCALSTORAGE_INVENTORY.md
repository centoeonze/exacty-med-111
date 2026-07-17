# localStorage Inventory (historical)

> **Closed in Stage 10A.** `LocalStorageRepository` and all browser-localStorage CMS paths were removed.  
> Runtime persistence is `ApiStorageRepository` → `/api/storage/:key` → Prisma `StorageEntry`.  
> This document is retained only as an audit trail from Stage 0.

Original inventory rows referred to `LocalStorageRepository.ts` methods on keys:

- `exacty-cms-draft`
- `exacty-cms-published`
- `exacty-cms-media-assets`

Those keys now live exclusively in SQLite `StorageEntry` via the Express API.
