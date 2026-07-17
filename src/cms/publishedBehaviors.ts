/**
 * Re-attach the same canvas bridges used by GrapesJS Preview onto the
 * published static HTML (CmsPageRenderer). No parallel animation logic —
 * portfolio Embla, Sobre van scroll, and testimonials CSS marquee are shared.
 */
import { enhanceAuthorityScrollInEditor } from "./editorAuthorityScroll";
import { enhancePortfolioCarouselsInEditor } from "./editorPortfolioCarousel";
import { setTestimonialsMarqueeMode } from "./editorTestimonialsMarquee";

export const enhancePublishedPageBehaviors = (doc: Document | null | undefined) => {
  if (!doc?.body) return;

  enhancePortfolioCarouselsInEditor(doc);
  enhanceAuthorityScrollInEditor(doc);
  // Same interactive autoplay path as GrapesJS Preview (CSS marquee + hover pause).
  setTestimonialsMarqueeMode(doc, "published");
};
