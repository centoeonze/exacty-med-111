import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MotionConfig } from "framer-motion";

/**
 * Framer Motion SSR emits initial={{ opacity: 0 }} as inline styles.
 * That hides the page inside the GrapesJS canvas. Strip those hide styles only.
 */
export const sanitizeSnapshotHtml = (html: string): string =>
  html.replace(/\sstyle="([^"]*)"/gi, (_match, styles: string) => {
    const cleaned = styles
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => {
        const lower = part.toLowerCase();
        if (/^opacity:\s*0$/.test(lower)) return false;
        if (/^transform:\s*translate/i.test(part)) return false;
        return true;
      })
      .join("; ");
    return cleaned ? ` style="${cleaned}"` : "";
  });

/** Render a React tree to GrapesJS-ready HTML (visible snapshot of the live Home). */
export const renderSnapshot = (node: ReactNode): string => {
  const html = renderToStaticMarkup(
    createElement(MotionConfig, { reducedMotion: "always" }, node)
  );
  return sanitizeSnapshotHtml(html);
};

export const renderComponentSnapshot = (Component: ComponentType): string =>
  renderSnapshot(createElement(Component));
