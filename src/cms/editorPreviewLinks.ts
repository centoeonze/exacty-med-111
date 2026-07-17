/**
 * Preview-only bridge: make CMS-embedded document links behave like the site.
 *
 * PDFs (and other files) uploaded through the Asset Manager are stored as
 * `data:` URLs. Browsers block top-level navigation to `data:` URLs, and the
 * GrapesJS canvas runs inside an iframe, so a native click on such a link does
 * nothing in Preview. Convert the data URL to a Blob URL and run the anchor's
 * own configured action (open the PDF / download the file) in the top window.
 *
 * This reuses the link's existing href / download / name — no parallel logic.
 *
 * Edit mode   → inert (GrapesJS selection and editing untouched).
 * Public site → unaffected (this module only runs in the CMS canvas).
 */

export type PreviewLinkMode = "edit" | "preview";

const READY_FLAG = "cmsPreviewLinksReady";

const isDataUrl = (href: string) => href.startsWith("data:");

const isPdfDataUrl = (href: string, blobType: string) =>
  href.startsWith("data:application/pdf") || blobType === "application/pdf";

const getMode = (doc: Document): PreviewLinkMode =>
  doc.body?.dataset.exactyGjsMode === "preview" ? "preview" : "edit";

const dataUrlToBlob = (dataUrl: string): Blob | null => {
  const match = /^data:([^;,]*)(;base64)?,([\s\S]*)$/.exec(dataUrl);
  if (!match) return null;

  const mime = match[1] || "application/octet-stream";
  const isBase64 = Boolean(match[2]);
  const payload = match[3] ?? "";

  try {
    if (isBase64) {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.codePointAt(i) ?? 0;
      return new Blob([bytes], { type: mime });
    }
    return new Blob([decodeURIComponent(payload)], { type: mime });
  } catch {
    return null;
  }
};

const activateDataLink = (doc: Document, anchor: HTMLAnchorElement): boolean => {
  const href = anchor.getAttribute("href") || "";
  const blob = dataUrlToBlob(href);
  if (!blob) return false;

  const topWin = doc.defaultView?.top ?? window;
  const topDoc = topWin.document;
  const url = topWin.URL.createObjectURL(blob);

  const hasDownload = anchor.hasAttribute("download");
  const wantsPdfView = isPdfDataUrl(href, blob.type);

  if (wantsPdfView || !hasDownload) {
    // Open (view) in a new tab — faithful to "abrir o PDF configurado".
    topWin.open(url, "_blank", "noopener");
  } else {
    const temp = topDoc.createElement("a");
    temp.href = url;
    temp.download =
      anchor.getAttribute("download") ||
      anchor.dataset.exactyPdfName ||
      "documento";
    topDoc.body.appendChild(temp);
    temp.click();
    temp.remove();
  }

  topWin.setTimeout(() => topWin.URL.revokeObjectURL(url), 60_000);
  return true;
};

const onCanvasClickCapture = (event: Event) => {
  const target = event.target as HTMLElement | null;
  const doc = target?.ownerDocument;
  if (!doc || getMode(doc) !== "preview") return;

  const anchor = target?.closest?.("a");
  if (!anchor) return;

  const href = anchor.getAttribute("href") || "";
  if (!isDataUrl(href)) return;

  event.preventDefault();
  event.stopPropagation();
  activateDataLink(doc, anchor as HTMLAnchorElement);
};

/**
 * Bind the preview link handler once per canvas document. The mode is read
 * live on each click from body[data-exacty-gjs-mode], so a single listener
 * serves both Edit (inert) and Preview.
 */
export const setPreviewLinkMode = (
  doc: Document | null | undefined,
  _mode: PreviewLinkMode,
): void => {
  if (!doc?.body) return;
  if (doc.body.dataset[READY_FLAG] === "1") return;
  doc.body.dataset[READY_FLAG] = "1";
  doc.addEventListener("click", onCanvasClickCapture, true);
};
