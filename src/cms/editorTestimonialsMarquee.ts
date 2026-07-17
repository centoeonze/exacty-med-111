/**
 * GrapesJS canvas: same Home testimonials CSS marquee
 * (`.testimonials-marquee-row` + `--marquee-duration: 176s`).
 *
 * Edit mode  → pause autoplay, allow horizontal scroll / selection.
 * Preview    → identical to published site: CSS autoplay only, no drag/swipe/scroll,
 *              hover pauses and resumes from the same offset.
 * Live React → left alone (`data-exacty-live-root`).
 *
 * Public site: same Preview autoplay path via setTestimonialsMarqueeMode(..., "published").
 */

const ATTR_READY = "data-cms-testimonials-bound";
const ATTR_HOVER = "data-cms-marquee-hover";
const ATTR_LOCK = "data-cms-marquee-lock";
const HOME_MARQUEE_DURATION = "176s";

export type TestimonialsCanvasMode = "edit" | "preview" | "published";

/** Preview and published share Home-like autoplay (no manual drag). */
const isAutoplayMode = (doc: Document | null) => {
  const mode = doc?.body?.dataset.exactyGjsMode;
  return mode === "preview" || mode === "published";
};

const getRow = (shell: HTMLElement) => {
  const flex = shell.querySelector<HTMLElement>(":scope > .flex.w-max, :scope > div.flex");
  if (flex) return flex;
  // Snapshot with reduced-motion fallback uses a grid — still one track child.
  return shell.querySelector<HTMLElement>(":scope > div");
};

const bindShell = (shell: HTMLElement) => {
  if (shell.getAttribute(ATTR_READY) === "1") return;
  if (shell.closest("[data-exacty-live-root]")) return;

  const row = getRow(shell);
  if (!row) return;

  // Home marquee track is flex + w-max (looping strip). Snapshots taken with
  // reduced-motion may be a grid — normalize to the Home track for autoplay.
  if (row.classList.contains("grid")) {
    row.classList.remove("grid", "grid-cols-1", "sm:grid-cols-2", "xl:grid-cols-3");
    row.classList.add("flex", "w-max", "items-stretch", "gap-4", "md:gap-5");
  }

  // Same markers the Home component applies when the section is in view.
  if (!row.classList.contains("testimonials-marquee-row")) {
    row.classList.add("testimonials-marquee-row");
  }
  row.style.setProperty("--marquee-duration", HOME_MARQUEE_DURATION);

  shell.setAttribute(ATTR_READY, "1");
};

/** Block wheel / touch / drag that would scroll or pan the marquee (Preview only). */
const lockManualMovement = (shell: HTMLElement, row: HTMLElement) => {
  if (shell.getAttribute(ATTR_LOCK) === "1") return;
  shell.setAttribute(ATTR_LOCK, "1");

  const blockIfPreview = (event: Event) => {
    if (!isAutoplayMode(shell.ownerDocument)) return;
    event.preventDefault();
    event.stopPropagation();
  };

  // Prevent trackpad / mouse-wheel horizontal scroll.
  shell.addEventListener(
    "wheel",
    (event) => {
      if (!isAutoplayMode(shell.ownerDocument)) return;
      if (Math.abs(event.deltaX) > 0 || event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { passive: false, capture: true },
  );

  // Prevent touch swipe / pan.
  shell.addEventListener("touchmove", blockIfPreview, { passive: false, capture: true });
  shell.addEventListener("pointerdown", (event) => {
    if (!isAutoplayMode(shell.ownerDocument)) return;
    // Allow hover pause; block drag gestures that pan content.
    if (event.pointerType === "touch" || event.pointerType === "pen") {
      event.preventDefault();
    }
  }, { capture: true });

  // Native HTML5 drag on images/text must not move the track.
  shell.addEventListener("dragstart", blockIfPreview, true);

  // Keep scroll offset reset while Preview/published autoplay is active.
  const resetScroll = () => {
    if (!isAutoplayMode(shell.ownerDocument)) return;
    shell.scrollLeft = 0;
    row.scrollLeft = 0;
  };
  shell.addEventListener("scroll", resetScroll, { passive: true });
};

const bindHoverPause = (shell: HTMLElement, row: HTMLElement) => {
  if (shell.getAttribute(ATTR_HOVER) === "1") return;
  shell.setAttribute(ATTR_HOVER, "1");

  shell.addEventListener("mouseenter", () => {
    if (isAutoplayMode(shell.ownerDocument)) {
      row.style.animationPlayState = "paused";
    }
  });
  shell.addEventListener("mouseleave", () => {
    if (isAutoplayMode(shell.ownerDocument)) {
      row.style.animationPlayState = "running";
    }
  });
};

const applyPreviewLikePublished = (shell: HTMLElement, row: HTMLElement) => {
  // Clear edit-mode overrides so CSS keyframes own transform again.
  row.style.removeProperty("animation-play-state");
  row.style.removeProperty("animation");
  row.style.removeProperty("transform");
  row.style.removeProperty("cursor");
  row.style.touchAction = "none";
  row.style.userSelect = "none";
  row.style.webkitUserSelect = "none";

  shell.scrollLeft = 0;
  row.scrollLeft = 0;
  shell.style.overflow = "hidden";
  shell.style.overflowX = "hidden";
  shell.style.overflowY = "hidden";
  shell.style.removeProperty("cursor");
  shell.style.removeProperty("-webkit-overflow-scrolling");
  shell.style.touchAction = "none";
  shell.style.overscrollBehavior = "none";
  shell.style.userSelect = "none";

  bindHoverPause(shell, row);
  lockManualMovement(shell, row);
};

const applyEditMode = (shell: HTMLElement, row: HTMLElement) => {
  // Edit: keep Home animation definition but paused; scroll to navigate/select.
  row.style.animationPlayState = "paused";
  row.style.transform = "none";
  row.style.removeProperty("touch-action");
  row.style.removeProperty("user-select");
  row.style.removeProperty("-webkit-user-select");

  shell.style.overflowX = "auto";
  shell.style.overflowY = "hidden";
  shell.style.webkitOverflowScrolling = "touch";
  shell.style.cursor = "grab";
  shell.style.removeProperty("touch-action");
  shell.style.removeProperty("overscroll-behavior");
  shell.style.removeProperty("user-select");
};

const applyModeToShell = (shell: HTMLElement, mode: TestimonialsCanvasMode) => {
  if (shell.closest("[data-exacty-live-root]")) return;

  const row = getRow(shell);
  if (!row) return;

  bindShell(shell);

  if (mode === "preview" || mode === "published") {
    applyPreviewLikePublished(shell, row);
  } else {
    applyEditMode(shell, row);
  }
};

/** Bind shells and set edit/preview mode (idempotent). */
export const setTestimonialsMarqueeMode = (
  doc: Document | null | undefined,
  mode: TestimonialsCanvasMode,
) => {
  if (!doc?.body) return;
  doc.body.setAttribute("data-exacty-gjs-mode", mode);
  doc.querySelectorAll<HTMLElement>(".testimonials-marquee-shell").forEach((shell) => {
    applyModeToShell(shell, mode);
  });
};

/** Default sync for canvas load/update → edit mode (paused). */
export const enhanceTestimonialsMarqueeInEditor = (doc: Document | null | undefined) => {
  setTestimonialsMarqueeMode(doc, "edit");
};
