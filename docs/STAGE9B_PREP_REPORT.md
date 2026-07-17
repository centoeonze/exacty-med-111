# Stage 9B Preparation Report — Final validation before legacy removal

## Summary

Prep-only stage: **Auth API validated in staging**, legacy usage documented,
remaining dependencies classified, removal plan drafted.  
**No legacy code was removed.**

---

## 1. Auth API in staging

### Config (`.env.staging`)

```bash
CMS_AUTH_PROVIDER=api
VITE_CMS_AUTH_PROVIDER=api
STORAGE_PROVIDER=api
VITE_CMS_ASSET_UPLOAD=api
```

### Rollback

```bash
CMS_AUTH_PROVIDER=vite
VITE_CMS_AUTH_PROVIDER=vite
```

(Default `.env` remains `vite` for everyday local use.)

### Validated flows (Playwright staging + server tests)

| Flow | Result |
|------|--------|
| Login via CMS UI → Express `/api/auth/login` | PASS |
| Session `GET /api/auth/me` authenticated | PASS |
| Logout → `/api/auth/logout` + me=false | PASS |
| Route protection `/admin` shows login after logout | PASS |
| Invalid credentials (server unit) | PASS |
| Password stored as bcrypt hash only | PASS |

Bootstrap: Express creates hashed admin from `CMS_USERNAME`/`CMS_PASSWORD` if missing.

---

## 2. Fallback monitoring

See **`docs/LEGACY_USAGE_REPORT.md`**.

| Channel | Probe |
|---------|-------|
| Storage fallback | `window.__CMS_FALLBACK_METRICS__` |
| Upload → base64 fallback | `window.__CMS_UPLOAD_FALLBACK_METRICS__` |
| Browser legacy keys | `window.__CMS_LEGACY_STORAGE__` |

Healthy staging expectation: both fallback counters stay at **0**.

---

## 3. Remaining dependency audit

### Pode remover (após aprovação 9B + métricas zero)

| Item | Notes |
|------|-------|
| `LocalStorageRepository` as **fallback** target | Only after `STORAGE_PROVIDER_FALLBACK=false` soak |
| `FallbackStorageRepository` | Same |
| `LegacyStorageInspector` + boot warn | After no browser keys / migration done |
| `vite-plugin-cms-auth.ts` + `/api/cms-auth` | After `CMS_AUTH_PROVIDER=api` is default everywhere |
| `VITE_CMS_ASSET_UPLOAD=legacy` path | After upload fallback metrics stay 0 |
| Contract tests that pin Local as primary | Retarget or drop |
| Docs referring to local as default | Update in 9B |

### Precisa migrar (antes ou durante 9B)

| Item | Why |
|------|-----|
| KV `exacty-cms-media-assets` base64 rows | Historical blobs; rewrite `src` to `/uploads/…` or drop safely |
| Draft/published HTML with embedded `data:` images | Optional content cleanup |
| Default `.env` auth still `vite` | Flip to `api` when ready (not removal — cutover) |
| `embedAsBase64: true` in Asset Manager config | Review once catalog has no data URLs |
| Playwright baseline fallback that injects base64 into localStorage | Update fixture to `/uploads` or API |

### Manter (não é “legado a apagar”)

| Item | Why |
|------|-----|
| `ApiStorageRepository` + `StorageEntry` KV for draft/published | Still the live CMS path |
| `Asset` table + `/api/assets` | Current source of truth for new files |
| `User` + `/api/auth` | Current auth path in staging |
| Light KV media index (`type`/`src`/`name`/`assetId`) | Useful until Grapes catalog fully API-driven |

---

## 4. Testes finais (prep run)

| Command | Result |
|---------|--------|
| `npm run test:api` | PASS — 29 |
| `npm run test` | PASS — 45 |
| Playwright API / staging (Auth API) | PASS — 5/5 |
| Playwright baseline (`CMS_AUTH_PROVIDER=vite`) | PASS — 7/7 |
| `npm run build` | PASS |

---

## 5. Plano de remoção proposto (Etapa 9B — ainda não executar)

1. **Cutover defaults:** `.env` → `CMS_AUTH_PROVIDER=api`; confirm soak.
2. **Disable storage fallback:** `STORAGE_PROVIDER_FALLBACK=false`; watch metrics.
3. **Disable upload legacy:** remove auto base64 fallback or gate behind explicit `legacy` only for emergencies.
4. **Purge data:** migrate/delete `data:` rows in KV + browser keys (backup first).
5. **Delete code:** `LocalStorageRepository`, `FallbackStorageRepository`, `LegacyStorageInspector`, Vite auth plugin, legacy upload branch.
6. **Clean tests/docs:** remove local-primary contracts; update baseline.
7. **Final report:** `STAGE9B_REPORT.md` + compatibility baseline.

**Stop condition:** any fallback metric > 0 or Playwright fail → abort removal.

---

## Explicit non-actions (this prep)

- ❌ Did not remove `LocalStorageRepository`
- ❌ Did not remove fallback
- ❌ Did not remove `LegacyStorageInspector`
- ❌ Did not remove Vite auth plugin
- ❌ Did not delete legacy base64 assets
