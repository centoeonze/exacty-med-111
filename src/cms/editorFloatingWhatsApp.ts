/**
 * Ensure the published FloatingWhatsAppButton exists in the GrapesJS canvas.
 * Uses the same React component snapshot as the Home (no parallel button).
 *
 * Existing drafts created before the button joined ExactyLandingPage get it
 * appended once into the wrapper so Editor + Preview match the site.
 */
import type { Editor } from "grapesjs";
import FloatingWhatsAppButton from "@/components/exacty/FloatingWhatsAppButton";
import { renderComponentSnapshot } from "./snapshotHtml";

const FLOATING_WA_SELECTOR = '[data-exacty-floating-whatsapp="1"]';

const wrapperHasFloatingWhatsApp = (editor: Editor) => {
  try {
    const html = editor.getHtml() || "";
    if (html.includes('data-exacty-floating-whatsapp="1"')) return true;
    if (html.includes("animate-whatsapp-float")) return true;
  } catch {
    /* ignore */
  }

  const doc = editor.Canvas.getDocument();
  return Boolean(doc?.querySelector?.(FLOATING_WA_SELECTOR));
};

/** Idempotent: inject the real FloatingWhatsAppButton snapshot if missing. */
export const ensureFloatingWhatsAppInEditor = (editor: Editor) => {
  if (wrapperHasFloatingWhatsApp(editor)) return;

  try {
    const html = renderComponentSnapshot(FloatingWhatsAppButton);
    editor.getWrapper()?.append(html);
  } catch (error) {
    console.error("[Exacty CMS] Falha ao inserir botão flutuante do WhatsApp", error);
  }
};
