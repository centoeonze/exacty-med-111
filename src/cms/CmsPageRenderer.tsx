import { useEffect, useMemo, useRef, useState } from "react";
import { enhancePublishedPageBehaviors } from "./publishedBehaviors";
import { loadPublished, type CmsPublishedPage } from "./storage";

type CmsPageRendererProps = {
  page?: CmsPublishedPage | null;
};

const CmsPageRenderer = ({ page: pageProp }: CmsPageRendererProps) => {
  const [page, setPage] = useState<CmsPublishedPage | null>(() => pageProp ?? loadPublished());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pageProp !== undefined) {
      setPage(pageProp);
      return;
    }
    setPage(loadPublished());
  }, [pageProp]);

  const css = useMemo(() => page?.css ?? "", [page?.css]);

  // Same Preview bridges: Embla portfolio, Sobre van scroll, testimonials marquee.
  useEffect(() => {
    if (!page?.html || !rootRef.current) return;

    const doc = rootRef.current.ownerDocument;
    let cancelled = false;
    let tries = 0;

    const run = () => {
      if (cancelled) return;
      enhancePublishedPageBehaviors(doc);
      // Layout may settle after fonts/images — one short retry like the CMS canvas.
      if (tries < 2) {
        tries += 1;
        window.setTimeout(run, tries === 1 ? 100 : 400);
      }
    };

    const raf = window.requestAnimationFrame(run);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [page?.html, css]);

  if (!page?.html) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={rootRef}
        className="cms-published-root"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </>
  );
};

export default CmsPageRenderer;
