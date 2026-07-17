/**
 * Extends GrapesJS Asset Manager with PDF documents alongside images.
 * Reuses the same AssetManager (no parallel media library).
 * Catalog persistence uses a dedicated key — does not alter draft/published save.
 *
 * Stage 10A: uploads only via POST /api/assets/upload → AssetService (no base64 fallback).
 */
import type { Editor } from "grapesjs";
import { MEDIA_ASSETS_KEY, getStorageRepository } from "./repositories";

export { MEDIA_ASSETS_KEY };

export type CmsAssetUploadMode = "api";

/** Stage 10A — Asset API is the only upload path. */
export const resolveCmsAssetUploadMode = (): CmsAssetUploadMode => "api";

const isPdfFile = (file: File) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const isImageFile = (file: File) => file.type.startsWith("image/");

type UploadedAssetRow = {
  type: string;
  src: string;
  name: string;
  assetId?: string;
};

const uploadFileViaApi = async (file: File, type: string): Promise<UploadedAssetRow> => {
  const body = new FormData();
  body.append("file", file, file.name);
  body.append("type", type);
  const res = await fetch("/api/assets/upload", {
    method: "POST",
    credentials: "same-origin",
    body,
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    asset?: { id: string; url: string; name?: string | null };
    error?: string;
  };
  if (!res.ok || !data.asset?.url) {
    throw new Error(data.error || `Upload failed (${res.status})`);
  }
  if (data.asset.url.startsWith("data:") || data.asset.url.startsWith("blob:")) {
    throw new Error("Invalid asset URL from API (embedded payloads are not allowed)");
  }
  return {
    type,
    src: data.asset.url,
    name: data.asset.name || file.name,
    assetId: data.asset.id,
  };
};

/** Upload one file via Asset API only. */
export const uploadCmsMediaFile = async (file: File): Promise<UploadedAssetRow> => {
  const type = isPdfFile(file) ? "pdf" : isImageFile(file) ? "image" : "";
  if (!type) {
    throw new Error(`Arquivo não suportado: ${file.name}. Envie apenas imagens ou PDF (.pdf).`);
  }
  return uploadFileViaApi(file, type);
};

export const fileNameFromSrc = (src: string, fallback = "documento.pdf") => {
  try {
    if (src.startsWith("data:")) return fallback;
    const path = src.split("?")[0];
    const part = path.split("/").pop();
    return decodeURIComponent(part || fallback);
  } catch {
    return fallback;
  }
};

export const loadPersistedMediaAssets = (): Array<Record<string, unknown>> =>
  getStorageRepository().loadMediaAssets();

export const persistMediaAssets = (editor: Editor) => {
  const assets = editor.AssetManager.getAll().map((asset) => ({
    type: asset.get("type"),
    src: asset.get("src"),
    name: asset.get("name"),
    assetId: asset.get("assetId") || undefined,
  }));
  getStorageRepository().saveMediaAssets(assets);
};

const isPdfAssetSrc = (src: string) =>
  !!src &&
  (src.startsWith("data:application/pdf") ||
    src.includes("application/pdf") ||
    /\.pdf($|\?|#)/i.test(src));

/** Same catalog as uploads: AssetManager + exacty-cms-media-assets (deduped by src). */
export const getUploadedPdfLibrary = (
  editor: Editor,
): Array<{ src: string; name: string; assetId?: string }> => {
  const bySrc = new Map<string, { src: string; name: string; assetId?: string }>();

  const put = (src: string, name: string, assetId?: string) => {
    if (!isPdfAssetSrc(src)) return;
    const label = (name || fileNameFromSrc(src)).trim() || "documento.pdf";
    if (!bySrc.has(src)) bySrc.set(src, { src, name: label, assetId });
  };

  editor.AssetManager.getAll().forEach((asset) => {
    const src = String(asset.get("src") || "");
    const type = String(asset.get("type") || "");
    const assetId = asset.get("assetId") ? String(asset.get("assetId")) : undefined;
    if (type === "pdf" || isPdfAssetSrc(src)) {
      put(src, String(asset.get("name") || ""), assetId);
    }
  });

  loadPersistedMediaAssets().forEach((row) => {
    if (row.type === "pdf" && row.src) {
      put(
        String(row.src),
        String(row.name || ""),
        row.assetId ? String(row.assetId) : undefined,
      );
    }
  });

  return Array.from(bySrc.values()).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
};

/** Clears PDF attrs on a component (same default state as trait "Remover PDF"). */
const clearPdfAttrsOnComponent = (component: {
  addAttributes: (a: Record<string, string>) => void;
  removeAttributes: (a: string | string[]) => void;
}) => {
  component.addAttributes({ href: "#" });
  component.removeAttributes(["download", "data-exacty-pdf", "data-exacty-pdf-name"]);
};

/** Unlink every canvas component that still points at this PDF src. */
const unlinkPdfFromComponents = (editor: Editor, src: string) => {
  const wrapper = editor.getWrapper();
  if (!wrapper) return;

  const visit = (component: {
    getAttributes: () => Record<string, string>;
    addAttributes: (a: Record<string, string>) => void;
    removeAttributes: (a: string | string[]) => void;
    components: () => { forEach: (cb: (c: typeof component) => void) => void };
  }) => {
    const href = String(component.getAttributes().href || "");
    if (href && href === src) clearPdfAttrsOnComponent(component);
    component.components().forEach(visit);
  };

  visit(wrapper as Parameters<typeof visit>[0]);
};

const deleteRemoteAsset = async (assetId: string) => {
  try {
    await fetch(`/api/assets/${encodeURIComponent(assetId)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
  } catch (error) {
    console.warn("[cms-assets] DELETE /api/assets failed", assetId, error);
  }
};

/**
 * Remove a PDF from AssetManager + KV catalog.
 * When assetId is known, also DELETE /api/assets/:id (Stage 9A).
 */
export const deletePdfFromLibrary = (editor: Editor, src: string) => {
  if (!src) return;

  const am = editor.AssetManager;
  const matches = am.getAll().filter((asset) => String(asset.get("src") || "") === src);

  const assetIds = new Set<string>();
  matches.forEach((asset) => {
    const id = asset.get("assetId");
    if (id) assetIds.add(String(id));
  });
  loadPersistedMediaAssets().forEach((row) => {
    if (String(row.src || "") === src && row.assetId) {
      assetIds.add(String(row.assetId));
    }
  });

  matches.forEach((asset) => am.remove(asset));

  if (matches.length === 0) {
    const remaining = loadPersistedMediaAssets().filter((row) => String(row.src || "") !== src);
    getStorageRepository().saveMediaAssets(remaining);
  } else {
    persistMediaAssets(editor);
  }

  assetIds.forEach((id) => {
    void deleteRemoteAsset(id);
  });

  unlinkPdfFromComponents(editor, src);
};

let pdfLibraryOverlay: HTMLElement | null = null;
let pdfLibraryKeyHandler: ((event: KeyboardEvent) => void) | null = null;

const closePdfLibrary = () => {
  if (pdfLibraryKeyHandler) {
    document.removeEventListener("keydown", pdfLibraryKeyHandler);
    pdfLibraryKeyHandler = null;
  }
  pdfLibraryOverlay?.remove();
  pdfLibraryOverlay = null;
};

const renderPdfLibraryList = (
  listWrap: HTMLElement,
  editor: Editor,
  onSelect: (src: string, name: string) => void,
) => {
  listWrap.replaceChildren();

  const pdfs = getUploadedPdfLibrary(editor);

  if (pdfs.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Nenhum PDF na biblioteca. Use “Enviar PDF” para adicionar arquivos.";
    empty.style.cssText = "margin:8px 4px;font-size:12px;line-height:1.5;color:#9ca3af;";
    listWrap.appendChild(empty);
    return;
  }

  pdfs.forEach(({ src, name }) => {
    const row = document.createElement("div");
    row.style.cssText =
      "display:flex;align-items:center;gap:10px;border-radius:10px;border:1px solid rgba(167,139,250,.22);background:#1a1228;padding:10px 12px;";

    const icon = document.createElement("div");
    icon.textContent = "PDF";
    icon.style.cssText =
      "flex-shrink:0;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(139,92,246,.15);font-size:11px;font-weight:700;letter-spacing:.04em;color:#c4b5fd;";

    const meta = document.createElement("div");
    meta.style.cssText = "min-width:0;flex:1;";
    const nameEl = document.createElement("div");
    nameEl.textContent = name;
    nameEl.style.cssText = "font-size:13px;font-weight:500;color:#f3e8ff;word-break:break-word;";
    meta.appendChild(nameEl);

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;flex-shrink:0;align-items:center;gap:6px;";

    const btnUse = document.createElement("button");
    btnUse.type = "button";
    btnUse.textContent = "Selecionar";
    btnUse.style.cssText =
      "cursor:pointer;border:1px solid rgba(167,139,250,.45);background:#2a1a44;color:#fff;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;";
    btnUse.onclick = (event) => {
      event.stopPropagation();
      onSelect(src, name);
      closePdfLibrary();
    };

    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.textContent = "Excluir";
    btnDelete.title = "Excluir PDF da biblioteca";
    btnDelete.style.cssText =
      "cursor:pointer;border:1px solid rgba(248,113,113,.45);background:#3f1d24;color:#fecaca;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;";
    btnDelete.onclick = (event) => {
      event.stopPropagation();
      const confirmed = window.confirm(
        "Tem certeza que deseja excluir este PDF? Esta ação não poderá ser desfeita.",
      );
      if (!confirmed) return;
      deletePdfFromLibrary(editor, src);
      renderPdfLibraryList(listWrap, editor, onSelect);
    };

    actions.append(btnUse, btnDelete);
    row.append(icon, meta, actions);
    listWrap.appendChild(row);
  });
};

/** Biblioteca dos PDFs já enviados (mesma fonte do Enviar PDF). */
export const openPdfAssetPicker = (
  editor: Editor,
  onSelect: (src: string, name: string) => void,
) => {
  closePdfLibrary();

  const overlay = document.createElement("div");
  overlay.setAttribute("data-exacty-pdf-library", "1");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(5,2,11,.72);padding:16px;";

  const panel = document.createElement("div");
  panel.style.cssText =
    "width:min(420px,100%);max-height:min(70vh,520px);display:flex;flex-direction:column;border-radius:14px;border:1px solid rgba(167,139,250,.35);background:#120a1e;box-shadow:0 24px 80px rgba(0,0,0,.45);overflow:hidden;";

  const header = document.createElement("div");
  header.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);";
  const title = document.createElement("div");
  title.textContent = "Biblioteca de PDFs";
  title.style.cssText = "font-size:14px;font-weight:600;color:#e9defd;";
  const btnClose = document.createElement("button");
  btnClose.type = "button";
  btnClose.textContent = "Fechar";
  btnClose.style.cssText =
    "cursor:pointer;border:1px solid rgba(255,255,255,.12);background:transparent;color:#c4b5fd;border-radius:8px;padding:4px 10px;font-size:12px;";
  btnClose.onclick = () => closePdfLibrary();
  header.append(title, btnClose);

  const listWrap = document.createElement("div");
  listWrap.style.cssText =
    "overflow-y:auto;padding:10px 12px 14px;display:flex;flex-direction:column;gap:8px;";

  renderPdfLibraryList(listWrap, editor, onSelect);

  panel.append(header, listWrap);
  overlay.appendChild(panel);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closePdfLibrary();
  });
  panel.addEventListener("click", (event) => event.stopPropagation());

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") closePdfLibrary();
  };
  pdfLibraryKeyHandler = onKey;
  document.addEventListener("keydown", onKey);

  document.body.appendChild(overlay);
  pdfLibraryOverlay = overlay;
};

export const getAssetManagerInitConfig = () => ({
  // Stage 10A — files live on /uploads via AssetService (no base64 embedding).
  embedAsBase64: false,
  upload: false as const,
  multiUpload: true,
  assets: loadPersistedMediaAssets(),
  noAssets: "Nenhuma mídia ainda. Envie uma imagem ou PDF.",
  uploadFile: async (
    ev: DragEvent & { target?: HTMLInputElement },
    clb?: (result: { data: Array<Record<string, unknown> | string> }) => void,
  ) => {
    const inputFiles = (ev.target as HTMLInputElement | undefined)?.files;
    const dtFiles = ev.dataTransfer?.files;
    const list = inputFiles?.length ? inputFiles : dtFiles;
    if (!list?.length) return;

    const data: Array<Record<string, unknown>> = [];
    for (const file of Array.from(list)) {
      try {
        if (!isPdfFile(file) && !isImageFile(file)) {
          window.alert(`Arquivo não suportado: ${file.name}. Envie apenas imagens ou PDF (.pdf).`);
          continue;
        }
        const row = await uploadCmsMediaFile(file);
        data.push(row);
      } catch (error) {
        console.error("[cms-assets] upload failed", error);
        window.alert(
          error instanceof Error ? error.message : `Falha ao enviar ${file.name}`,
        );
      }
    }

    if (data.length) clb?.({ data });
  },
});

/** Register PDF asset type on the shared Asset Manager (call after editor init). */
export const registerPdfAssetType = (editor: Editor) => {
  const am = editor.AssetManager;

  am.addType("pdf", {
    model: {
      defaults: {
        type: "pdf",
        src: "",
        name: "documento.pdf",
      },
    },
    view: {
      getPreview() {
        const name = this.model.get("name") || fileNameFromSrc(this.model.get("src"));
        return `<div style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;height:100%;padding:8px;background:#1a1228;color:#e9defd;font:12px/1.3 sans-serif;text-align:center;border:1px solid rgba(167,139,250,.35);border-radius:8px">
          <div style="font-size:22px;font-weight:700;letter-spacing:.04em;color:#c4b5fd">PDF</div>
          <div style="word-break:break-all;opacity:.9">${name}</div>
        </div>`;
      },
      getInfo() {
        return this.model.get("name") || fileNameFromSrc(this.model.get("src"));
      },
    },
    isType(value: unknown) {
      if (typeof value === "object" && value && (value as { type?: string }).type === "pdf") {
        return { type: "pdf", ...(value as object) };
      }
      if (typeof value === "string") {
        const src = value;
        if (src.startsWith("data:application/pdf") || /\.pdf($|\?)/i.test(src)) {
          return { type: "pdf", src, name: fileNameFromSrc(src) };
        }
      }
      if (typeof value === "object" && value && "src" in value) {
        const src = String((value as { src: string }).src || "");
        if (src.startsWith("data:application/pdf") || /\.pdf($|\?)/i.test(src)) {
          return {
            type: "pdf",
            src,
            name: (value as { name?: string }).name || fileNameFromSrc(src),
            assetId: (value as { assetId?: string }).assetId,
          };
        }
      }
      return false;
    },
  });

  editor.on("asset:add", () => persistMediaAssets(editor));
  editor.on("asset:remove", () => persistMediaAssets(editor));
};

export { isPdfFile };
