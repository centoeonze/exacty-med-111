import type { CmsDraft } from "./storage";

/**
 * Live React host drafts are a single non-editable wrapper — GrapesJS cannot
 * select inner sections. Full-page snapshots include hero/produtos markers.
 */
export const isDraftEditableInGrapes = (draft: CmsDraft | null): boolean => {
  if (!draft) return false;
  const raw = JSON.stringify(draft);
  if (raw.length < 200) return false;

  const hasSectionMarkers =
    raw.includes('id="hero"') ||
    raw.includes('id="produtos"') ||
    raw.includes('id="regulatorio"') ||
    raw.includes("exacty-page-shell");

  const isLiveOnlyShell =
    raw.includes("exacty-live-landing") && !hasSectionMarkers && raw.length < 20000;

  if (isLiveOnlyShell) return false;

  return hasSectionMarkers || raw.length > 20000;
};
