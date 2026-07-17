# CMS Compatibility Baseline

Referência oficial atualizada até a **Etapa 9B Prep** (sem remoção de legado).

## Etapa 9B Prep

| Item | Status |
|------|--------|
| Auth API em staging (`CMS_AUTH_PROVIDER=api`) | PASS |
| Rollback auth `vite` no `.env` default | PASS |
| `docs/LEGACY_USAGE_REPORT.md` | PASS |
| Dependências classificadas (remover vs migrar) | PASS |
| Plano de remoção documentado | PASS |
| Código legado removido | NOT APPLICABLE — ainda não |

Relatórios: `docs/STAGE9B_PREP_REPORT.md`, `docs/LEGACY_USAGE_REPORT.md`.

## Execuções

| Comando | Resultado |
|---------|-----------|
| `npm run test:api` | PASS — 29 |
| `npm run test` | PASS — 45 |
| Playwright staging (Auth API) | PASS — 5/5 |
| Playwright baseline | PASS — 7/7 |
| `npm run build` | PASS |

## Próximo (aprovação explícita) — Etapa 9B remoção

Seguir plano em `STAGE9B_PREP_REPORT.md` §5. Abortar se métricas de fallback > 0.
