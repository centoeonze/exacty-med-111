/**
 * GrapesJS canvas-only: the Sobre van uses Framer `useScroll` + `useTransform`
 * on the Home React tree. Editable snapshots are static HTML, so that hook never
 * runs. Re-bind the same progress math to the canvas iframe window scroll —
 * same offsets as Home: ["start end", "end start"] → progress 0..1.
 *
 * Live React preview (`data-exacty-live-root`) is skipped (Framer already owns it).
 */

const ATTR_READY = "data-cms-authority-scroll";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Same progress Framer useScroll(target, offset: ["start end", "end start"]) uses. */
const sectionScrollProgress = (section: HTMLElement, viewportHeight: number) => {
  const rect = section.getBoundingClientRect();
  const total = viewportHeight + rect.height;
  if (total <= 0) return 0;
  return clamp((viewportHeight - rect.top) / total, 0, 1);
};

const findStockVisual = (section: HTMLElement) =>
  Array.from(section.querySelectorAll<HTMLElement>("div")).find((el) =>
    el.className.includes("aspect-[5/5.2]"),
  );

const findVanTrack = (van: HTMLElement) => van.parentElement;

const computeVanBounds = (
  track: HTMLElement,
  van: HTMLElement,
  stock: HTMLElement,
  viewportWidth: number,
) => {
  const trackRect = track.getBoundingClientRect();
  const stockRect = stock.getBoundingClientRect();
  const trackWidth = trackRect.width;
  const vanWidth = van.offsetWidth;

  if (!trackWidth || !vanWidth) {
    return null;
  }

  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const startX = -vanWidth * 1.2;
  const targetRatio = isMobile ? 0.5 : isTablet ? 0.56 : 0.62;
  const desiredEndX =
    stockRect.left - trackRect.left + stockRect.width * targetRatio - vanWidth * 0.5;
  const edgePadding = isMobile ? 12 : isTablet ? 24 : 36;
  const endX = clamp(desiredEndX, startX, trackWidth - vanWidth - edgePadding);

  return { startX, endX };
};

const bindAuthoritySection = (section: HTMLElement, win: Window) => {
  if (section.getAttribute(ATTR_READY) === "1") return;
  if (section.closest("[data-exacty-live-root]")) return;

  const van = section.querySelector<HTMLElement>(".will-change-transform");
  const stock = findStockVisual(section);
  if (!van || !stock) return;

  const track = findVanTrack(van);
  if (!track) return;

  section.setAttribute(ATTR_READY, "1");

  let frameId = 0;
  let bounds = { startX: -240, endX: -240 };

  const updateBounds = () => {
    const next = computeVanBounds(track, van, stock, win.innerWidth);
    if (next) bounds = next;
  };

  const applyVanX = () => {
    frameId = 0;
    const progress = sectionScrollProgress(section, win.innerHeight);
    const x = bounds.startX + (bounds.endX - bounds.startX) * progress;
    // Same axis Framer drives via style={{ x: vanX }}
    van.style.transform = `translateX(${x}px)`;
    van.style.willChange = "transform";
  };

  const onScrollOrResize = () => {
    updateBounds();
    if (frameId) return;
    frameId = win.requestAnimationFrame(applyVanX);
  };

  updateBounds();
  applyVanX();

  win.addEventListener("scroll", onScrollOrResize, { passive: true });
  win.addEventListener("resize", onScrollOrResize);

  const resizeObserver =
    typeof win.ResizeObserver !== "undefined" ? new win.ResizeObserver(onScrollOrResize) : null;
  resizeObserver?.observe(track);
  resizeObserver?.observe(stock);
  resizeObserver?.observe(van);
};

export const enhanceAuthorityScrollInEditor = (doc: Document | null | undefined) => {
  if (!doc?.body) return;
  const win = doc.defaultView;
  if (!win) return;

  const section = doc.getElementById("sobre");
  if (section) bindAuthoritySection(section, win);
};
