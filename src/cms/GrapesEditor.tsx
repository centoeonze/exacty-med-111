import { useEffect, useRef, useState } from "react";
import grapesjs, { type Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import blocksBasic from "grapesjs-blocks-basic";
import siteCssUrl from "@/index.css?url";
import siteCssInline from "@/index.css?inline";
import canvasRevealCssUrl from "./cms-canvas-reveal.css?url";
import { registerExactyBlocks } from "./blocks";
import { getDefaultPageHtml } from "./defaultPage";
import { enhancePortfolioCarouselsInEditor, registerPortfolioCarouselEditor } from "./editorPortfolioCarousel";
import { enhanceAuthorityScrollInEditor } from "./editorAuthorityScroll";
import { ensureFloatingWhatsAppInEditor } from "./editorFloatingWhatsApp";
import { setNavbarInteractionMode } from "./editorNavbar";
import { setPreviewLinkMode } from "./editorPreviewLinks";
import {
  setTestimonialsMarqueeMode,
} from "./editorTestimonialsMarquee";
import { registerExactyLiveLandingType, registerExactyLivePreviewBlock } from "./exactyLiveLanding";
import { isDraftEditableInGrapes } from "./draftEditable";
import { getAssetManagerInitConfig, registerPdfAssetType } from "./mediaManager";
import { registerPdfDocumentTraits } from "./pdfDocumentTrait";
import {
  exportCmsJson,
  loadDraft,
  parseImportFile,
  saveDraft,
  savePublished,
  type CmsDraft,
} from "./storage";
import { cmsTrace, cmsTraceBegin } from "./cmsSaveTrace";
import {
  getStorageRepository,
  resolveCmsStorageProvider,
} from "./repositories";
type StatusTone = "idle" | "ok" | "err";

type GrapesEditorProps = {
  onLogout?: () => void | Promise<void>;
};

/**
 * Compiled site CSS for Publish — inlined at build time so static hosts
 * never depend on a runtime fetch of /assets/*.css (which 404/HTML-fallback
 * used to abort Publish with "Falha ao publicar").
 */
const loadSiteCssText = async (): Promise<string> => {
  const css = typeof siteCssInline === "string" ? siteCssInline : "";
  cmsTrace(6, "loadSiteCssText (?inline)", true, { cssLen: css.length });
  return css;
};

const GrapesEditor = ({ onLogout }: GrapesEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ tone: StatusTone; message: string }>({
    tone: "idle",
    message: "Pronto para editar",
  });

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: "100%",
      width: "auto",
      fromElement: false,
      storageManager: false,
      noticeOnUnload: false,
      assetManager: getAssetManagerInitConfig(),
      plugins: [
        (editor) =>
          blocksBasic(editor, {
            blocks: ["text", "link", "image"],
            flexGrid: false,
            category: "Básico",
          }),
      ],
      canvas: {
        styles: [siteCssUrl, canvasRevealCssUrl],
      },
      deviceManager: {
        devices: [
          { name: "Desktop", width: "" },
          { name: "Tablet", width: "768px", widthMedia: "992px" },
          { name: "Mobile", width: "375px", widthMedia: "480px" },
        ],
      },
    });

    registerPdfAssetType(editor);
    registerPdfDocumentTraits(editor);
    registerExactyLiveLandingType(editor);
    registerExactyLivePreviewBlock(editor);
    registerExactyBlocks(editor);
    registerPortfolioCarouselEditor(editor);

    const syncEditorCanvasBehaviors = () => {
      try {
        const doc = editor.Canvas.getDocument();
        enhancePortfolioCarouselsInEditor(doc);
        enhanceAuthorityScrollInEditor(doc);
        const inPreview = editor.Commands.isActive("preview");
        const mode = inPreview ? "preview" : "edit";
        setTestimonialsMarqueeMode(doc, mode);
        setNavbarInteractionMode(doc, mode);
        setPreviewLinkMode(doc, mode);
      } catch (error) {
        console.error("[Exacty CMS] Falha ao ativar comportamentos do canvas", error);
      }
    };

    const ensureWhatsAppThenSync = () => {
      try {
        ensureFloatingWhatsAppInEditor(editor);
      } catch (error) {
        console.error("[Exacty CMS] Falha ao garantir botão WhatsApp", error);
      }
      syncEditorCanvasBehaviors();
    };

    editor.on("canvas:frame:load", ensureWhatsAppThenSync);
    editor.on("load", ensureWhatsAppThenSync);
    editor.on("component:mount", syncEditorCanvasBehaviors);
    editor.on("update", syncEditorCanvasBehaviors);

    // Native GrapesJS preview command: Edit ↔ Preview.
    editor.on("run:preview", () => {
      const doc = editor.Canvas.getDocument();
      setTestimonialsMarqueeMode(doc, "preview");
      setNavbarInteractionMode(doc, "preview");
      setPreviewLinkMode(doc, "preview");
    });
    editor.on("stop:preview", () => {
      const doc = editor.Canvas.getDocument();
      setTestimonialsMarqueeMode(doc, "edit");
      setNavbarInteractionMode(doc, "edit");
      setPreviewLinkMode(doc, "edit");
    });

    try {
      const draft = loadDraft();
      // Restore GrapesJS tree when possible; skip live-only React shell drafts.
      if (draft && isDraftEditableInGrapes(draft)) {
        editor.loadProjectData(draft);
      } else {
        editor.setComponents(getDefaultPageHtml());
      }
    } catch (error) {
      console.error("[Exacty CMS] Falha ao carregar conteúdo inicial", error);
      setStatus({
        tone: "err",
        message: "Não foi possível carregar o rascunho. O editor abriu com a página padrão.",
      });
      try {
        editor.setComponents(getDefaultPageHtml());
      } catch (fallbackError) {
        console.error("[Exacty CMS] Fallback da página padrão também falhou", fallbackError);
      }
    }

    // Frame may already be ready after setComponents
    requestAnimationFrame(ensureWhatsAppThenSync);
    setTimeout(ensureWhatsAppThenSync, 100);
    setTimeout(ensureWhatsAppThenSync, 500);

    editorRef.current = editor;

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  const flash = (tone: StatusTone, message: string) => {
    setStatus({ tone, message });
  };

  const getProject = (): CmsDraft => {
    const editor = editorRef.current;
    if (!editor) return {};
    return editor.getProjectData() as CmsDraft;
  };

  const handleSave = () => {
    cmsTraceBegin("save");
    cmsTrace(1, "Clique recebido (Salvar)");
    try {
      cmsTrace(2, "Evento do botão / handleSave disparado");
      cmsTrace(3, "Método save() chamado", true, {
        hasEditor: Boolean(editorRef.current),
      });
      const repo = getStorageRepository();
      const provider = resolveCmsStorageProvider();
      cmsTrace(4, "StorageRepository selecionado", true, {
        repoName: repo.constructor.name,
      });
      cmsTrace(5, "Provider ativo", true, {
        provider,
        windowFlag: (window as unknown as { __CMS_STORAGE_PROVIDER__?: string })
          .__CMS_STORAGE_PROVIDER__,
        mode: import.meta.env.MODE,
        prod: import.meta.env.PROD,
        dev: import.meta.env.DEV,
      });
      const project = getProject();
      cmsTrace(6, "Dados sendo serializados", true, {
        projectKeys: Object.keys(project || {}).slice(0, 12),
        approxJsonLen: (() => {
          try {
            return JSON.stringify(project).length;
          } catch {
            return -1;
          }
        })(),
      });
      cmsTrace(7, "Escrita iniciada (saveDraft)");
      saveDraft(project);
      const stored = localStorage.getItem("exacty-cms-draft");
      cmsTrace(8, "Escrita concluída", Boolean(stored), {
        localStorageBytes: stored?.length ?? 0,
      });
      flash("ok", "Rascunho salvo no navegador");
      cmsTrace(9, "Estado atualizado (flash ok)");
      cmsTrace(10, "Mensagem de sucesso");
    } catch (error) {
      cmsTrace(8, "ERRO — execução interrompida", false, {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      console.error("[Exacty CMS] Falha ao salvar rascunho", error);
      flash("err", "Falha ao salvar rascunho");
    }
  };

  const handlePublish = async () => {
    cmsTraceBegin("publish");
    cmsTrace(1, "Clique recebido (Publicar)");
    const editor = editorRef.current;
    if (!editor) {
      cmsTrace(2, "ERRO — editorRef null; Publish abortado", false);
      return;
    }
    try {
      cmsTrace(2, "Evento do botão / handlePublish disparado");
      cmsTrace(3, "Método publish() chamado");
      const repo = getStorageRepository();
      const provider = resolveCmsStorageProvider();
      cmsTrace(4, "StorageRepository selecionado", true, {
        repoName: repo.constructor.name,
      });
      cmsTrace(5, "Provider ativo", true, {
        provider,
        windowFlag: (window as unknown as { __CMS_STORAGE_PROVIDER__?: string })
          .__CMS_STORAGE_PROVIDER__,
        mode: import.meta.env.MODE,
        prod: import.meta.env.PROD,
      });
      const project = getProject();
      cmsTrace(6, "Dados sendo serializados (draft+html+css)", true, {
        projectKeys: Object.keys(project || {}).slice(0, 12),
      });
      cmsTrace(7, "Escrita iniciada (saveDraft + savePublished)");
      saveDraft(project);
      const html = editor.getHtml();
      const siteCss = await loadSiteCssText();
      const css = `${siteCss}\n${editor.getCss() ?? ""}`;
      savePublished({ html, css });
      const stored = localStorage.getItem("exacty-cms-published");
      cmsTrace(8, "Escrita concluída", Boolean(stored), {
        localStorageBytes: stored?.length ?? 0,
        htmlLen: html.length,
        cssLen: css.length,
      });
      flash("ok", "Página publicada — abra / para ver");
      cmsTrace(9, "Estado atualizado (flash ok)");
      cmsTrace(10, "Mensagem de sucesso");
    } catch (error) {
      cmsTrace(8, "ERRO — execução interrompida", false, {
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      console.error("[Exacty CMS] Falha ao publicar", error);
      flash("err", "Falha ao publicar");
    }
  };

  const handleExport = () => {
    try {
      exportCmsJson(getProject(), true);
      flash("ok", "JSON exportado");
    } catch {
      flash("err", "Falha ao exportar");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editorRef.current) return;
    try {
      const draft = await parseImportFile(file);
      editorRef.current.loadProjectData(draft);
      saveDraft(draft);
      requestAnimationFrame(() => {
        if (!editorRef.current) return;
        ensureFloatingWhatsAppInEditor(editorRef.current);
        const doc = editorRef.current.Canvas.getDocument();
        enhancePortfolioCarouselsInEditor(doc);
        enhanceAuthorityScrollInEditor(doc);
        const inPreview = editorRef.current.Commands.isActive("preview");
        const mode = inPreview ? "preview" : "edit";
        setTestimonialsMarqueeMode(doc, mode);
        setNavbarInteractionMode(doc, mode);
        setPreviewLinkMode(doc, mode);
      });
      flash("ok", "JSON importado");
    } catch {
      flash("err", "Arquivo JSON inválido");
    }
  };

  const handleReset = () => {
    if (!editorRef.current) return;
    const ok = window.confirm("Resetar para a página padrão? O rascunho atual será substituído.");
    if (!ok) return;
    editorRef.current.setComponents(getDefaultPageHtml());
    editorRef.current.setStyle("");
    saveDraft(getProject());
    requestAnimationFrame(() => {
      if (!editorRef.current) return;
      ensureFloatingWhatsAppInEditor(editorRef.current);
      const doc = editorRef.current.Canvas.getDocument();
      enhancePortfolioCarouselsInEditor(doc);
      enhanceAuthorityScrollInEditor(doc);
      setTestimonialsMarqueeMode(doc, "edit");
      setNavbarInteractionMode(doc, "edit");
      setPreviewLinkMode(doc, "edit");
    });
    flash("ok", "Página restaurada ao padrão");
  };

  return (
    <div className="flex h-screen flex-col bg-[#0b0714] text-white">
      <header className="flex flex-shrink-0 flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2 sm:px-4">
        <a href="/" className="mr-2 text-sm font-semibold tracking-tight text-violet-200 hover:text-white">
          Exacty CMS
        </a>
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={handlePublish}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold hover:bg-violet-500"
        >
          Publicar
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
        >
          Exportar
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
        >
          Importar
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10"
        >
          Reset
        </button>
        {onLogout ? (
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            Sair
          </button>
        ) : null}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
        <span
          className={`ml-auto text-xs ${
            status.tone === "ok"
              ? "text-emerald-300"
              : status.tone === "err"
                ? "text-rose-300"
                : "text-white/50"
          }`}
        >
          {status.message}
        </span>
      </header>
      <div ref={containerRef} className="min-h-0 flex-1" />
    </div>
  );
};

export default GrapesEditor;
