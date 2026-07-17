# Migration Final Report — Exacty Med CMS

**Status:** Migration officially complete (Stage 10B)  
**Date:** 2026-07-17  
**Previous:** `docs/STAGE10A_REPORT.md`

---

## Resumo

### Objetivo

Migrar o CMS de persistência no browser (`localStorage`) e auth/upload ad hoc no Vite para uma arquitetura server-side estável: **Express + Prisma + SQLite**, com autenticação bcrypt e arquivos em disco via **AssetService**.

### Arquitetura antiga

```
Browser
  ├─ localStorage (draft / published / media base64)
  ├─ Vite plugin /api/cms-auth (CMS_USERNAME / CMS_PASSWORD em texto no .env)
  └─ FileReader.readAsDataURL → data:image / data:application/pdf
```

### Arquitetura nova

```
Frontend (React + GrapesJS)
        │
        ▼
Express API (/api/storage, /api/auth, /api/assets)
        │
        ▼
Prisma
        │
        ▼
SQLite (server/prisma/cms.db)
        │
        ├─ StorageEntry  ← draft / published / catálogo leve de mídia
        ├─ Project / Page / Version  ← domínio + migração / seed
        ├─ Asset  ← metadados de ficheiros
        └─ User   ← auth
        │
        ▼
uploads/  ← ficheiros binários (AssetService)
```

---

## Etapas executadas (0 → 10)

| Etapa | Foco |
|-------|------|
| **0 / 0.5** | `IStorageRepository`, baseline Playwright, inventário localStorage |
| **1–2** | Express `/api/storage`, Prisma `StorageEntry` (KV) |
| **3** | Modelos de domínio: Project, Page, Version, Asset, User |
| **4** | Migração localStorage → domínio; shadow read |
| **5–6** | Ativação controlada da API; staging |
| **7** | Default `STORAGE_PROVIDER=api`; LocalStorage só como fallback |
| **8** | `AssetService`, `/api/assets`, `/uploads`, User.role |
| **9A** | Media Manager → Asset API; Auth Express + flag vite\|api |
| **9B Prep** | Validação Auth API em staging; relatório de uso legado |
| **9C Prep** | Migração de `data:` base64 → ficheiros + Asset; refs reescritas |
| **10A** | Remoção de LocalStorage, fallback, Vite auth, upload base64 |
| **10B** | Encerramento: auditoria, limpeza, documentação final |

---

## Arquitetura final

### Storage — resposta objetiva

**O CMS ainda utiliza `StorageEntry` (Key/Value) como camada principal de persistência** para o editor GrapesJS.

| Pergunta | Resposta |
|----------|----------|
| Persiste diretamente em `Project` / `Page` / `Version` / `Asset` no Salvar do editor? | **Não** (exceto uploads → `Asset`) |
| Camada principal de draft / published / catálogo? | **Sim — `StorageEntry`** |

**Por que `StorageEntry` ainda existe?**

- O contrato do editor (`loadDraft` / `saveDraft` / `savePublished` / media catalog) foi estabilizado sobre chaves KV (`exacty-cms-draft`, `exacty-cms-published`, `exacty-cms-media-assets`).
- Migrar o hot-path do GrapesJS para CRUD de `Page`/`Version` exigiria dual-write e mudança de fluxo — **fora do escopo** das etapas de cutover; foi deixado como arquitetura definitiva operacional.

**É arquitetura definitiva ou só compatibilidade?**

- **Definitiva para o runtime do editor** (único caminho após 10A).
- Modelos `Project` / `Page` / `Version` fazem parte do schema final para: migração histórica, `seed:kv-from-domain`, e evolução futura (versionamento rico / dual-write).
- **`Asset`** é o caminho definitivo de mídia (ficheiros + metadados).
- **`User`** é o caminho definitivo de auth.

### Frontend

- React + GrapesJS (UI inalterada na migração)
- `ApiStorageRepository` → `GET/POST/DELETE /api/storage/:key`
- `cmsAuthApi` → `/api/auth/login|logout|me`
- `uploadCmsMediaFile` → `POST /api/assets/upload`

### Express API

- Storage, Auth, Assets, Health
- Proxy Vite: `/api` e `/uploads` → porta API

### Prisma → SQLite

- Ficheiro: `server/prisma/cms.db`
- Migrations: `init_storage` → `cms_entities` → `user_role`

### Assets

- Disco: `server/uploads/`
- Metadados: tabela `Asset` (`url`, `storagePath`, `mimeType`, `sizeBytes`)
- Sem base64 em novos uploads

### Auth

- `AuthService` + `User.passwordHash` (bcrypt)
- Cookie HttpOnly `exacty_cms_session`
- Bootstrap opcional via `CMS_USERNAME` / `CMS_PASSWORD` (só servidor)

---

## Banco

### Migrations

| Migration | Conteúdo |
|-----------|----------|
| `20260717160445_init_storage` | `StorageEntry` + unique(`key`) |
| `20260717161046_cms_entities` | Project, Page, Version, Asset, User + FKs/índices |
| `20260717180000_user_role` | `User.role` default `editor` |

### Tabelas finais

| Tabela | Função |
|--------|--------|
| **StorageEntry** | Persistência principal do CMS (draft, published, catálogo de mídia KV) |
| **Project** | Workspace / site |
| **Page** | Página de domínio (content JSON); usada em seed/migração |
| **Version** | Snapshots draft/published de domínio |
| **Asset** | Metadados de ficheiros em `uploads/` |
| **User** | Contas CMS (email, username, passwordHash, role) |

### Índices / constraints (principais)

- `StorageEntry.key` UNIQUE  
- `Project.slug` UNIQUE  
- `Page(projectId, slug)` UNIQUE; index `projectId`  
- `Version` indexes `(projectId, status)`, `pageId`; FK → Project CASCADE  
- `Asset` index `(projectId, type)`; FK → Project CASCADE  
- `User.email` / `User.username` UNIQUE  

---

## Fluxos

| Fluxo | Caminho |
|-------|---------|
| **Edição** | GrapesJS em memória; sem storageManager nativo |
| **Salvar** | `saveDraft` → `/api/storage/exacty-cms-draft` → `StorageEntry` |
| **Preview** | Canvas / iframe GrapesJS (estado atual) |
| **Publish** | `savePublished` → `/api/storage/exacty-cms-published` → Home lê published |
| **Upload** | `POST /api/assets/upload` → ficheiro + `Asset`; catálogo KV leve com `src` + `assetId` |
| **Login** | `POST /api/auth/login` → bcrypt → cookie HttpOnly; `GET /api/auth/me` |

---

## Auditoria final (legado)

### Sem código legado *ativo*

Confirmado em `src/` + `vite.config.ts` via `legacyRemoval.guard.test.ts` e busca global.

### Referências restantes (não são runtime legado)

| Local | Motivo |
|-------|--------|
| `docs/STAGE*.md`, `LEGACY_*.md` | Documentação histórica |
| `src/test/legacyRemoval.guard.test.ts` | Guard lista padrões proibidos |
| `mediaManager.ts` / `pdfDocumentTrait.ts` / `editorPreviewLinks.ts` | Detecção de `data:application/pdf` **já existente** em catálogo antigo (leitura), não upload |
| `src/test/storageContract.ts`, Playwright baseline | Fixtures de teste com `data:` |
| `server` migration/asset tests | Fixtures de migração / assert de rejeição de data URL |
| `src/components/exacty/productPortfolioData.ts` | SVG placeholder do site público (`data:image/svg+xml`) — fora do CMS upload |
| Scripts `migrate:local-storage` / `migrate:legacy-assets` | Ferramentas one-shot / ops, não caminho do editor |

### Limpeza 10B

| Removido | Motivo |
|----------|--------|
| `server/src/scripts/seed-legacy-data-urls.ts` | Seed temporário da Etapa 9C |

Mantidos: relatórios históricos de etapa; scripts de migração ops; `LOCALSTORAGE_INVENTORY.md` (histórico reduzido).

---

## Resultados (validação 10B)

| Check | Resultado |
|-------|-----------|
| `npm run test` | **PASS (20)** |
| `npm run test:api` | **PASS (32)** |
| Playwright staging | **PASS (5/5)** |
| Playwright baseline | **PASS (7/7)** |
| `npm run build` | **PASS** |

---

## Observações

### Pendências (não bloqueantes)

- Dual-write editor → `Page` / `Version` em tempo real (melhoria futura; hoje KV é canónico).
- Chaves antigas no `localStorage` do browser do operador (inofensivas; CMS não as lê).

### Melhorias futuras (opcional)

- Versionamento explícito via API `Version` no Salvar/Publicar
- Admin de utilizadores (CRUD) além do bootstrap env
- Backup agendado de `cms.db` + `uploads/`
- PostgreSQL se a escala exigir

---

## Confirmações finais

| Critério | Estado |
|----------|--------|
| Sem código legado ativo (LocalStorage / fallback / Vite auth / base64 upload) | ✅ |
| Upload exclusivamente via AssetService | ✅ |
| Auth exclusivamente via AuthService | ✅ |
| Storage via arquitetura final (`StorageEntry` KV + `Asset` para ficheiros) | ✅ |
| CMS pronto para produção (com API + SQLite + backups) | ✅ |

**Esta etapa encerra oficialmente a migração. Nenhuma etapa adicional foi iniciada.**
