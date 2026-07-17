/**
 * GrapesJS canvas-only bridge: the editor loads a static HTML snapshot of the
 * Home portfolio (no React). Re-attach the same Embla engine + opts used by
 * ProductPortfolioSection / ui/carousel — do not invent parallel scroll math.
 *
 * Also mirror Home's activeIndex sync (api.selectedScrollSnap → PortfolioCard
 * isActive classes) so the card glow follows the centered slide.
 *
 * Duplicated slides: reInit Embla when slide count changes; strip duplicate HTML
 * ids and assign data-exacty-portfolio-card so each card is an independent CMS item.
 */
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel";
import type { Component, Editor } from "grapesjs";

const ATTR_READY = "data-cms-carousel-ready";
const ATTR_NAV_BOUND = "data-cms-carousel-nav-bound";
const ATTR_SLIDE_COUNT = "data-cms-carousel-slide-count";
const PORTFOLIO_CARD_ATTR = "data-exacty-portfolio-card";
const EMBLA_KEY = "__exactyCmsEmbla" as const;

/** Same options as ProductPortfolioSection → <Carousel opts={{ align, loop }}> */
const homeCarouselOpts = (slideCount: number) => ({
  align: "center" as const,
  loop: slideCount > 1,
});

/** Same active / inactive classes as PortfolioCard when isActive toggles. */
const ACTIVE_CARD_CLASSES = [
  "scale-[1.02]",
  "border-violet-400/40",
  "shadow-[0_30px_100px_rgba(139,92,246,0.22)]",
] as const;

const INACTIVE_CARD_CLASSES = [
  "border-white/10",
  "opacity-80",
  "hover:border-white/20",
  "hover:opacity-100",
] as const;

const ACTIVE_OVERLAY_CLASSES = [
  "bg-[linear-gradient(140deg,rgba(255,255,255,0.12),transparent_18%,rgba(139,92,246,0.12)_58%,rgba(255,255,255,0.02)_100%)]",
  "opacity-100",
] as const;

type EmblaHost = HTMLElement & { [EMBLA_KEY]?: EmblaCarouselType };

const isCarouselNavButton = (button: HTMLButtonElement, kind: "prev" | "next") => {
  const label = `${button.getAttribute("aria-label") ?? ""} ${button.textContent ?? ""}`.toLowerCase();
  if (kind === "prev") return label.includes("previous slide");
  return label.includes("next slide");
};

const enableNavButton = (button: HTMLButtonElement) => {
  button.removeAttribute("disabled");
  button.style.opacity = "1";
  button.style.pointerEvents = "auto";
  button.style.visibility = "visible";
};

const syncNavButtons = (
  api: EmblaCarouselType,
  prev: HTMLButtonElement | undefined,
  next: HTMLButtonElement | undefined,
) => {
  if (prev) {
    if (api.canScrollPrev()) enableNavButton(prev);
    else {
      prev.setAttribute("disabled", "");
      prev.style.opacity = "0";
      prev.style.pointerEvents = "none";
    }
  }
  if (next) {
    if (api.canScrollNext()) enableNavButton(next);
    else {
      next.setAttribute("disabled", "");
      next.style.opacity = "0";
      next.style.pointerEvents = "none";
    }
  }
};

const getCardButton = (slide: HTMLElement) =>
  slide.querySelector<HTMLElement>(":scope > button");

/** Overlay div that PortfolioCard toggles with isActive (gradient + opacity). */
const getActiveOverlay = (card: HTMLElement) =>
  Array.from(card.querySelectorAll<HTMLElement>(":scope > div")).find((el) =>
    el.className.includes("transition-opacity"),
  );

/**
 * Same mechanism as ProductPortfolioSection.syncActiveSlide:
 * activeIndex = api.selectedScrollSnap() → isActive on PortfolioCard.
 */
const syncActiveCardStyles = (api: EmblaCarouselType, slides: HTMLElement[]) => {
  const activeIndex = api.selectedScrollSnap();

  slides.forEach((slide, index) => {
    const card = getCardButton(slide);
    if (!card) return;

    const isActive = index === activeIndex;

    if (isActive) {
      card.classList.remove(...INACTIVE_CARD_CLASSES);
      card.classList.add(...ACTIVE_CARD_CLASSES);
      card.style.opacity = "1";
    } else {
      card.classList.remove(...ACTIVE_CARD_CLASSES);
      card.classList.add(...INACTIVE_CARD_CLASSES);
      card.style.opacity = "";
    }

    const overlay = getActiveOverlay(card);
    if (!overlay) return;

    if (isActive) {
      overlay.classList.add(...ACTIVE_OVERLAY_CLASSES);
      overlay.classList.remove("opacity-0");
    } else {
      overlay.classList.remove(...ACTIVE_OVERLAY_CLASSES);
      overlay.classList.add("opacity-0");
    }
  });
};

/** Editor-only: stop GrapesJS from stealing the click so Embla can run. */
const allowEmblaClick = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
  (event as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.();
};

const blockEditorCapture = (event: Event) => {
  event.stopPropagation();
};

const getSlidesInViewport = (viewport: HTMLElement) =>
  Array.from(viewport.querySelectorAll<HTMLElement>('[aria-roledescription="slide"]'));

const bindCarouselNavOnce = (
  root: HTMLElement,
  api: EmblaCarouselType,
  prev: HTMLButtonElement | undefined,
  next: HTMLButtonElement | undefined,
) => {
  if (root.getAttribute(ATTR_NAV_BOUND) === "1") return;
  root.setAttribute(ATTR_NAV_BOUND, "1");

  [prev, next].forEach((button) => {
    if (!button) return;
    button.addEventListener("mousedown", blockEditorCapture, true);
    button.addEventListener("pointerdown", blockEditorCapture, true);
    button.addEventListener("touchstart", blockEditorCapture, true);
  });

  prev?.addEventListener(
    "click",
    (event) => {
      allowEmblaClick(event);
      api.scrollPrev();
    },
    true,
  );
  next?.addEventListener(
    "click",
    (event) => {
      allowEmblaClick(event);
      api.scrollNext();
    },
    true,
  );
};

const bindCarousel = (root: HTMLElement) => {
  const viewport = root.querySelector<HTMLElement>(":scope > .overflow-hidden");
  if (!viewport) return;

  const slides = getSlidesInViewport(viewport);
  if (slides.length === 0) return;

  const slideCount = slides.length;
  const prevCount = Number(root.getAttribute(ATTR_SLIDE_COUNT) || "0");

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>("button"));
  const prev = buttons.find((btn) => isCarouselNavButton(btn, "prev"));
  const next = buttons.find((btn) => isCarouselNavButton(btn, "next"));

  const host = viewport as EmblaHost;
  let api = host[EMBLA_KEY];

  const refreshCarousel = () => {
    const liveSlides = getSlidesInViewport(viewport);
    syncNavButtons(api!, prev, next);
    syncActiveCardStyles(api!, liveSlides);
  };

  if (api && root.getAttribute(ATTR_READY) === "1") {
    if (prevCount !== slideCount) {
      api.reInit(homeCarouselOpts(slideCount));
      root.setAttribute(ATTR_SLIDE_COUNT, String(slideCount));
    }
    refreshCarousel();
    return;
  }

  host[EMBLA_KEY]?.destroy();
  api = EmblaCarousel(viewport, homeCarouselOpts(slideCount));
  host[EMBLA_KEY] = api;

  root.setAttribute(ATTR_READY, "1");
  root.setAttribute(ATTR_SLIDE_COUNT, String(slideCount));

  api.on("select", refreshCarousel);
  api.on("reInit", refreshCarousel);
  refreshCarousel();

  bindCarouselNavOnce(root, api, prev, next);
};

const isPortfolioCarouselEl = (el: HTMLElement | null | undefined) =>
  !!el?.closest('#produtos [aria-roledescription="carousel"]');

const findPortfolioSlideComponent = (component: Component): Component | null => {
  let current: Component | null = component;
  while (current) {
    const attrs = current.getAttributes();
    if (attrs["aria-roledescription"] === "slide") {
      const el = current.getEl();
      if (isPortfolioCarouselEl(el)) return current;
    }
    current = current.parent();
  }
  return null;
};

const stripHtmlIdsFromComponentTree = (component: Component) => {
  component.removeAttributes("id");
  component.components().forEach(stripHtmlIdsFromComponentTree);
};

const ensurePortfolioCardIdentity = (slide: Component) => {
  if (!slide.getAttributes()[PORTFOLIO_CARD_ATTR]) {
    slide.addAttributes({ [PORTFOLIO_CARD_ATTR]: crypto.randomUUID() });
  }
};

const normalizeClonedPortfolioSlide = (slide: Component) => {
  stripHtmlIdsFromComponentTree(slide);
  slide.addAttributes({ [PORTFOLIO_CARD_ATTR]: crypto.randomUUID() });
};

/** GrapesJS: duplicated portfolio cards must be independent CMS components. */
export const registerPortfolioCarouselEditor = (editor: Editor) => {
  editor.on("component:clone", (cloned: Component) => {
    const slide = findPortfolioSlideComponent(cloned);
    if (!slide) return;
    normalizeClonedPortfolioSlide(slide);
  });

  editor.on("component:add", (component: Component) => {
    const slide = findPortfolioSlideComponent(component);
    if (!slide) return;
    ensurePortfolioCardIdentity(slide);
  });
};

export const enhancePortfolioCarouselsInEditor = (doc: Document | null | undefined) => {
  if (!doc?.body) return;
  doc.querySelectorAll<HTMLElement>('[aria-roledescription="carousel"]').forEach((root) => {
    // Live ExactyLandingPage already runs Embla via React — do not double-bind.
    if (root.closest("[data-exacty-live-root]")) return;
    bindCarousel(root);
  });
};
