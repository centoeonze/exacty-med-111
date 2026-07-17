import type { ComponentType } from "react";
import type { Editor } from "grapesjs";
import NavbarExactyMed from "@/components/exacty/NavbarExactyMed";
import HeroExactyMed from "@/components/exacty/HeroExactyMed";
import TrustSectionExactyMed from "@/components/exacty/TrustSectionExactyMed";
import RegulatorySectionExactyMed from "@/components/exacty/RegulatorySectionExactyMed";
import ProductPortfolioSection from "@/components/exacty/ProductPortfolioSection";
import AuthoritySectionExactyMed from "@/components/exacty/AuthoritySectionExactyMed";
import TestimonialsSectionExactyMed from "@/components/exacty/TestimonialsSectionExactyMed";
import FAQSectionExactyMed from "@/components/exacty/FAQSectionExactyMed";
import FinalCTASection from "@/components/exacty/FinalCTASection";
import FooterExactyMed from "@/components/exacty/FooterExactyMed";
import FloatingWhatsAppButton from "@/components/exacty/FloatingWhatsAppButton";
import { renderComponentSnapshot } from "./snapshotHtml";

export const BLOCK_CATEGORY = "Exacty Med";

const renderBlock = (Component: ComponentType): string => renderComponentSnapshot(Component);

/** Block HTML sourced from the same React section components as the live Home. */
export const sectionHtml = {
  get navbar() {
    return renderBlock(NavbarExactyMed);
  },
  get hero() {
    return renderBlock(HeroExactyMed);
  },
  get trust() {
    return renderBlock(TrustSectionExactyMed);
  },
  get regulatory() {
    return renderBlock(RegulatorySectionExactyMed);
  },
  get portfolio() {
    return renderBlock(ProductPortfolioSection);
  },
  get authority() {
    return renderBlock(AuthoritySectionExactyMed);
  },
  get testimonials() {
    return renderBlock(TestimonialsSectionExactyMed);
  },
  get faq() {
    return renderBlock(FAQSectionExactyMed);
  },
  get cta() {
    return renderBlock(FinalCTASection);
  },
  get footer() {
    return renderBlock(FooterExactyMed);
  },
  get floatingWhatsApp() {
    return renderBlock(FloatingWhatsAppButton);
  },
};

const BLOCK_DEFS: Array<{ id: string; label: string; Component: ComponentType }> = [
  { id: "exacty-navbar", label: "Navbar", Component: NavbarExactyMed },
  { id: "exacty-hero", label: "Hero", Component: HeroExactyMed },
  { id: "exacty-trust", label: "Confiança", Component: TrustSectionExactyMed },
  { id: "exacty-regulatory", label: "Regulatório", Component: RegulatorySectionExactyMed },
  { id: "exacty-portfolio", label: "Portfólio", Component: ProductPortfolioSection },
  { id: "exacty-authority", label: "Autoridade", Component: AuthoritySectionExactyMed },
  { id: "exacty-testimonials", label: "Depoimentos", Component: TestimonialsSectionExactyMed },
  { id: "exacty-faq", label: "FAQ", Component: FAQSectionExactyMed },
  { id: "exacty-cta", label: "CTA Final", Component: FinalCTASection },
  { id: "exacty-footer", label: "Footer", Component: FooterExactyMed },
  { id: "exacty-floating-whatsapp", label: "WhatsApp Flutuante", Component: FloatingWhatsAppButton },
];

/** Trait to edit a component's inner text from the side panel (mirrors inline editing). */
const registerButtonLabelTrait = (editor: Editor) => {
  const tm = editor.TraitManager;
  if (tm.getType("text-content")) return;

  tm.addType("text-content", {
    createInput() {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Texto do botão";
      input.style.cssText =
        "width:100%;box-sizing:border-box;border:1px solid rgba(167,139,250,.45);background:#160f24;color:#f3e8ff;border-radius:8px;padding:6px 10px;font-size:12px;";
      return input;
    },
    onEvent({ elInput, component }) {
      component.components((elInput as HTMLInputElement).value);
    },
    onUpdate({ elInput, component }) {
      (elInput as HTMLInputElement).value = component.getEl?.()?.textContent?.trim() ?? "";
    },
  });
};

export const registerExactyBlocks = (editor: Editor) => {
  const bm = editor.BlockManager;

  registerButtonLabelTrait(editor);

  BLOCK_DEFS.forEach(({ id, label, Component }) => {
    try {
      const content = renderBlock(Component);
      bm.add(id, {
        label,
        category: BLOCK_CATEGORY,
        content,
        media: `<div style="font-size:11px;padding:6px;text-align:center;color:#a78bfa">${label}</div>`,
      });
    } catch (error) {
      console.error(`[Exacty CMS] Falha ao registrar bloco ${id}`, error);
    }
  });

  // Editable CTA button — same link/PDF traits as the rest of the CMS (not a parallel system).
  bm.add("exacty-button", {
    label: "Botão",
    category: BLOCK_CATEGORY,
    media: `<div style="font-size:11px;padding:6px;text-align:center;color:#a78bfa">Botão</div>`,
    content: {
      type: "link",
      tagName: "a",
      editable: true,
      attributes: {
        href: "#",
        class:
          "inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,#8b5cf6_0%,#6d28d9_100%)] px-5 py-3 text-sm font-semibold text-white",
      },
      content: "Botão",
      traits: [
        {
          type: "text-content",
          name: "exacty-label",
          label: "Texto",
          changeProp: true,
        },
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
