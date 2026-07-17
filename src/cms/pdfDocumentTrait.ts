/**
 * Reusable PDF document trait for any link/component that needs a PDF attachment.
 * Uses the shared Asset Manager (images + PDFs) — no parallel upload flow.
 */
import type { Editor } from "grapesjs";
import { fileNameFromSrc, openPdfAssetPicker } from "./mediaManager";

const isPdfHref = (href: string) =>
  !!href &&
  (href.startsWith("data:application/pdf") ||
    /\.pdf($|\?|#)/i.test(href) ||
    href.includes("application/pdf"));

const looksLikeDocumentLink = (component: {
  get: (k: string) => unknown;
  getAttributes: () => Record<string, string>;
}) => {
  const tag = String(component.get("tagName") || "").toLowerCase();
  if (tag !== "a") return false;
  const attrs = component.getAttributes();
  const href = attrs.href || "";
  const text = String(component.get("content") || "").toLowerCase();
  return (
    isPdfHref(href) ||
    attrs.download !== undefined ||
    attrs["data-exacty-pdf"] === "1" ||
    text.includes("baixar") ||
    text.includes("pdf") ||
    text.includes("catálogo") ||
    text.includes("catalogo") ||
    text.includes("download") ||
    text.includes("documento")
  );
};

const applyPdfToComponent = (
  component: { addAttributes: (a: Record<string, string>) => void },
  src: string,
  name: string,
) => {
  component.addAttributes({
    href: src,
    download: name || "documento.pdf",
    "data-exacty-pdf": "1",
    "data-exacty-pdf-name": name || fileNameFromSrc(src),
    target: "_blank",
    rel: "noopener noreferrer",
  });
};

const clearPdfFromComponent = (component: {
  addAttributes: (a: Record<string, string>) => void;
  removeAttributes: (a: string | string[]) => void;
}) => {
  component.addAttributes({ href: "#" });
  component.removeAttributes(["download", "data-exacty-pdf", "data-exacty-pdf-name"]);
};

export const registerPdfDocumentTraits = (editor: Editor) => {
  editor.TraitManager.addType("pdf-file", {
    noLabel: true,
    createInput({ component }) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;padding:4px 0;";

      const nameEl = document.createElement("div");
      nameEl.style.cssText = "font-size:12px;color:#c4b5fd;word-break:break-all;";

      const urlEl = document.createElement("div");
      urlEl.style.cssText = "font-size:11px;color:#9ca3af;word-break:break-all;opacity:.85;";

      const row = document.createElement("div");
      row.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";

      const btnSelect = document.createElement("button");
      btnSelect.type = "button";
      btnSelect.textContent = "Selecionar PDF";
      btnSelect.style.cssText =
        "cursor:pointer;border:1px solid rgba(167,139,250,.45);background:#2a1a44;color:#fff;border-radius:8px;padding:6px 10px;font-size:12px;";

      const btnUpload = document.createElement("button");
      btnUpload.type = "button";
      btnUpload.textContent = "Enviar PDF";
      btnUpload.style.cssText = btnSelect.style.cssText;

      const btnRemove = document.createElement("button");
      btnRemove.type = "button";
      btnRemove.textContent = "Remover PDF";
      btnRemove.style.cssText =
        "cursor:pointer;border:1px solid rgba(248,113,113,.45);background:#3f1d24;color:#fecaca;border-radius:8px;padding:6px 10px;font-size:12px;";

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "application/pdf,.pdf";
      fileInput.style.display = "none";

      const refresh = () => {
        const attrs = component.getAttributes();
        const href = attrs.href || "";
        const name = attrs["data-exacty-pdf-name"] || fileNameFromSrc(href, "");
        const hasPdf = isPdfHref(href);
        nameEl.textContent = hasPdf ? `Arquivo: ${name || "documento.pdf"}` : "Nenhum PDF selecionado";
        urlEl.textContent = hasPdf
          ? href.startsWith("data:")
            ? "URL: (incorporado no projeto)"
            : `URL: ${href.slice(0, 120)}${href.length > 120 ? "…" : ""}`
          : "";
        btnRemove.style.display = hasPdf ? "inline-flex" : "none";
      };

      btnSelect.onclick = () => {
        openPdfAssetPicker(editor, (src, name) => {
          applyPdfToComponent(component, src, name);
          refresh();
        });
      };

      btnUpload.onclick = () => fileInput.click();

      fileInput.onchange = async () => {
        const file = fileInput.files?.[0];
        fileInput.value = "";
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          window.alert("Apenas arquivos PDF (.pdf) são permitidos.");
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const src = String(reader.result);
          editor.AssetManager.add({ type: "pdf", src, name: file.name });
          applyPdfToComponent(component, src, file.name);
          refresh();
        };
        reader.readAsDataURL(file);
      };

      btnRemove.onclick = () => {
        clearPdfFromComponent(component);
        refresh();
      };

      row.append(btnSelect, btnUpload, btnRemove);
      wrap.append(nameEl, urlEl, row, fileInput);
      refresh();

      component.on("change:attributes", refresh);

      return wrap;
    },
  });

  editor.on("component:selected", (component) => {
    if (!looksLikeDocumentLink(component)) return;

    const traits = component.getTraits();
    const hasPdfTrait = traits.some((t: { get: (k: string) => string }) => t.get("type") === "pdf-file");
    if (hasPdfTrait) return;

    component.addTrait({
      type: "pdf-file",
      name: "exacty-pdf",
      label: "Documento PDF",
    });
  });

  editor.BlockManager.add("exacty-pdf-button", {
    label: "Botão PDF",
    category: "Exacty Med",
    media: `<div style="font-size:11px;padding:6px;text-align:center;color:#c4b5fd">PDF</div>`,
    content: {
      type: "link",
      tagName: "a",
      attributes: {
        href: "#",
        "data-exacty-pdf": "1",
        class:
          "inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#8b5cf6_0%,#6d28d9_100%)] px-5 py-3 text-sm font-semibold text-white",
      },
      content: "Baixar PDF",
      traits: [
        "id",
        "title",
        "href",
        "target",
        {
          type: "pdf-file",
          name: "exacty-pdf",
          label: "Documento PDF",
        },
      ],
    },
  });
};
