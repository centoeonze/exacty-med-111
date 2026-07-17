/**
 * Draft / Publish domain: versioned snapshots, checksums, promote-only publish.
 * GrapesJS UI is unchanged — only persistence semantics live here.
 */
import { isDraftEditableInGrapes } from "./draftEditable";
import {
  DRAFT_SNAPSHOT_KIND,
  PUBLISHED_SNAPSHOT_KIND,
  type CmsDraft,
  type CmsDraftSnapshot,
  type CmsProjectData,
  type CmsPublishedPage,
} from "./repositories/types";
import { getStorageRepository } from "./repositories";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const isDraftSnapshot = (value: unknown): value is CmsDraftSnapshot => {
  if (!isRecord(value)) return false;
  return (
    value.kind === DRAFT_SNAPSHOT_KIND &&
    typeof value.versionId === "string" &&
    typeof value.updatedAt === "string" &&
    typeof value.checksum === "string" &&
    isRecord(value.project) &&
    typeof value.html === "string" &&
    typeof value.css === "string"
  );
};

/** Stable non-crypto checksum for integrity checks (browser + Node tests). */
export const computeContentChecksum = (
  project: CmsProjectData,
  html: string,
  css: string,
): string => {
  const payload = JSON.stringify({ project, html, css });
  let hash = 5381;
  for (let i = 0; i < payload.length; i += 1) {
    hash = Math.imul(hash, 33) ^ payload.charCodeAt(i);
  }
  return `c${(hash >>> 0).toString(16)}`;
};

export const createVersionId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

/** Extract GrapesJS project from storage (snapshot v2 or legacy raw project). */
export const extractProjectFromStoredDraft = (
  stored: CmsDraft | CmsDraftSnapshot | null,
): CmsProjectData | null => {
  if (!stored) return null;
  if (isDraftSnapshot(stored)) return stored.project;
  if (isRecord(stored) && (stored.pages || stored.assets || stored.styles)) {
    return stored as CmsProjectData;
  }
  return null;
};

export const loadDraftSnapshot = (): CmsDraftSnapshot | null => {
  const stored = getStorageRepository().loadDraft();
  if (!stored) return null;
  if (isDraftSnapshot(stored)) return stored;
  // Legacy: raw project only — cannot publish until user Saves again (creates html/css).
  return null;
};

export type DraftValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export const validateDraftSnapshot = (draft: CmsDraftSnapshot): DraftValidationResult => {
  if (!draft.html?.trim()) {
    return { ok: false, error: "Rascunho inválido: HTML vazio." };
  }
  if (!draft.css && draft.css !== "") {
    return { ok: false, error: "Rascunho inválido: CSS ausente." };
  }
  if (!draft.versionId?.trim()) {
    return { ok: false, error: "Rascunho inválido: versionId ausente." };
  }
  const expected = computeContentChecksum(draft.project, draft.html, draft.css);
  if (draft.checksum !== expected) {
    return { ok: false, error: "Rascunho inválido: checksum não confere." };
  }
  if (!isDraftEditableInGrapes(draft.project) && draft.html.length < 80) {
    return { ok: false, error: "Rascunho inválido: estrutura do editor insuficiente." };
  }
  // Light asset / structure checks — cancel publish rather than overwrite Published.
  if (/<img[^>]+src=["']\s*["']/i.test(draft.html)) {
    return { ok: false, error: "Rascunho inválido: imagem com src vazio." };
  }
  if (!/<[a-z][\s\S]*>/i.test(draft.html)) {
    return { ok: false, error: "Rascunho inválido: HTML sem elementos." };
  }
  return { ok: true };
};

export type SaveDraftFromEditorInput = {
  project: CmsProjectData;
  html: string;
  css: string;
};

/**
 * Save: serialize editor → Draft only. Never touches Published.
 * Generates versionId, updatedAt, checksum.
 */
export const saveDraftFromEditor = (input: SaveDraftFromEditorInput): CmsDraftSnapshot => {
  const html = String(input.html ?? "");
  const css = String(input.css ?? "");
  const project = input.project ?? {};

  if (!html.trim()) {
    throw new Error("Não foi possível salvar: conteúdo HTML vazio.");
  }

  const versionId = createVersionId();
  const updatedAt = new Date().toISOString();
  const checksum = computeContentChecksum(project, html, css);

  const snapshot: CmsDraftSnapshot = {
    kind: DRAFT_SNAPSHOT_KIND,
    versionId,
    updatedAt,
    checksum,
    project,
    html,
    css,
  };

  const validation = validateDraftSnapshot(snapshot);
  if (validation.ok === false) {
    throw new Error(validation.error);
  }

  getStorageRepository().saveDraft(snapshot);
  return snapshot;
};

/**
 * Publish: promote last saved Draft → Published.
 * Does not read the editor or re-serialize — only copies Draft.
 */
export const publishLatestDraft = (): CmsPublishedPage => {
  const draft = loadDraftSnapshot();
  if (!draft) {
    throw new Error(
      "Nenhum rascunho versionado para publicar. Clique em Salvar antes de Publicar.",
    );
  }

  const validation = validateDraftSnapshot(draft);
  if (validation.ok === false) {
    throw new Error(validation.error);
  }

  const publishedAt = new Date().toISOString();
  const published: CmsPublishedPage = {
    kind: PUBLISHED_SNAPSHOT_KIND,
    versionId: draft.versionId,
    publishedAt,
    updatedAt: publishedAt,
    checksum: draft.checksum,
    html: draft.html,
    css: draft.css,
  };

  return getStorageRepository().savePublished(published);
};

/** Normalize published rows from legacy { html, css, updatedAt } storage. */
export const normalizePublishedPage = (
  raw: CmsPublishedPage | null,
): CmsPublishedPage | null => {
  if (!raw?.html) return null;
  if (raw.versionId && raw.checksum && raw.publishedAt) {
    return {
      ...raw,
      updatedAt: raw.updatedAt || raw.publishedAt,
    };
  }
  // Legacy publish without versioning — still renderable on the public site.
  const publishedAt = raw.updatedAt || new Date().toISOString();
  return {
    kind: PUBLISHED_SNAPSHOT_KIND,
    versionId: raw.versionId || `legacy-${publishedAt}`,
    publishedAt,
    updatedAt: publishedAt,
    checksum: raw.checksum || computeContentChecksum({}, raw.html, raw.css ?? ""),
    html: raw.html,
    css: raw.css ?? "",
  };
};
