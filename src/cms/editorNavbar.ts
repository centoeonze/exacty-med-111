/**
 * GrapesJS canvas-only Navbar bridge (same Home markup / hash links).
 *
 * Edit mode   → no navigation; clicks select/edit in GrapesJS (href kept).
 * Preview     → native link behavior from the Home markup + mobile drawer state.
 * Live React  → skipped (`data-exacty-live-root`).
 *
 * Mode comes from GrapesJS preview command via body[data-exacty-gjs-mode].
 */

const ATTR_READY = "data-cms-navbar-ready";
const DRAWER_ATTR = "data-cms-navbar-drawer";

export type NavbarCanvasMode = "edit" | "preview";

const getMode = (doc: Document): NavbarCanvasMode =>
  doc.body?.dataset.exactyGjsMode === "preview" ? "preview" : "edit";

const collectHashLinks = (navRoot: HTMLElement) => {
  const seen = new Set<string>();
  const links: Array<{ href: string; label: string }> = [];

  navRoot.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    if (!href.startsWith("#") || href.length < 2 || seen.has(href)) return;
    seen.add(href);

    const text = (anchor.textContent || "").trim();
    const label = text || (href === "#hero" ? "Início" : href.slice(1));
    links.push({ href, label });
  });

  return links;
};

const ensureMobileDrawer = (shellWrap: HTMLElement, nav: HTMLElement) => {
  let drawer = shellWrap.querySelector<HTMLElement>(`[${DRAWER_ATTR}]`);
  if (drawer) return drawer;

  const links = collectHashLinks(nav);
  drawer = shellWrap.ownerDocument.createElement("div");
  drawer.setAttribute(DRAWER_ATTR, "1");
  drawer.className = "hero-mobile-drawer mt-3 px-5 pb-6 pt-4 lg:hidden";
  drawer.hidden = true;
  drawer.style.display = "none";

  const inner = shellWrap.ownerDocument.createElement("div");
  inner.className = "flex flex-col gap-2";

  links.forEach(({ href, label }) => {
    const a = shellWrap.ownerDocument.createElement("a");
    a.href = href;
    a.className = "hero-nav-link rounded-2xl px-4 py-3 text-sm font-medium";
    a.textContent = label;
    inner.appendChild(a);
  });

  const wa = nav.querySelector<HTMLAnchorElement>('a[href*="wa.me"], a[href*="whatsapp"]');
  if (wa) {
    const cta = shellWrap.ownerDocument.createElement("a");
    cta.href = wa.href;
    cta.target = "_blank";
    cta.rel = "noopener noreferrer";
    cta.className =
      "hero-cta-primary mt-3 inline-flex items-center justify-center px-5 py-3 text-sm font-semibold text-white";
    cta.textContent = (wa.textContent || "Entre em contato").trim();
    inner.appendChild(cta);
  }

  drawer.appendChild(inner);
  shellWrap.appendChild(drawer);
  return drawer;
};

const setDrawerOpen = (drawer: HTMLElement, button: HTMLElement | null, open: boolean) => {
  drawer.hidden = !open;
  drawer.style.display = open ? "" : "none";
  if (button) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
};

const bindNavbar = (nav: HTMLElement) => {
  if (nav.getAttribute(ATTR_READY) === "1") return;
  if (nav.closest("[data-exacty-live-root]")) return;

  const doc = nav.ownerDocument;
  const shellWrap = nav.parentElement;
  if (!shellWrap) return;

  nav.setAttribute(ATTR_READY, "1");

  const menuButton = nav.querySelector<HTMLElement>(".hero-menu-button, button[aria-label*='menu' i]");
  const drawer = ensureMobileDrawer(shellWrap, nav);
  let drawerOpen = false;

  shellWrap.addEventListener(
    "click",
    (event) => {
      const mode = getMode(doc);
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest<HTMLAnchorElement>("a");
      if (anchor && shellWrap.contains(anchor)) {
        // Edit: block all link navigation (hash + external); keep propagation for GrapesJS selection.
        if (mode === "edit") {
          event.preventDefault();
          return;
        }

        // Preview: let anchors use the same native hash/external navigation as the site.
        if (anchor.closest(`[${DRAWER_ATTR}]`)) {
          drawerOpen = false;
          setDrawerOpen(drawer, menuButton, false);
        }
        return;
      }

      const btn = target.closest<HTMLElement>(".hero-menu-button, button[aria-label*='menu' i]");
      if (btn && nav.contains(btn)) {
        // Edit: let GrapesJS select the menu button.
        if (mode === "edit") return;

        event.preventDefault();
        event.stopPropagation();
        (event as Event & { stopImmediatePropagation?: () => void }).stopImmediatePropagation?.();
        drawerOpen = !drawerOpen;
        setDrawerOpen(drawer, menuButton, drawerOpen);
      }
    },
    true,
  );
};

/** Close any open mobile drawers when leaving Preview. */
export const setNavbarInteractionMode = (
  doc: Document | null | undefined,
  mode: NavbarCanvasMode,
) => {
  if (!doc?.body) return;
  doc.body.dataset.exactyGjsMode = mode;

  if (mode === "edit") {
    doc.querySelectorAll<HTMLElement>(`[${DRAWER_ATTR}]`).forEach((drawer) => {
      const shell = drawer.parentElement;
      const button = shell?.querySelector<HTMLElement>(".hero-menu-button, button[aria-label*='menu' i]") ?? null;
      setDrawerOpen(drawer, button, false);
    });
  }

  enhanceNavbarInEditor(doc);
};

export const enhanceNavbarInEditor = (doc: Document | null | undefined) => {
  if (!doc?.body) return;
  doc.querySelectorAll<HTMLElement>("nav.hero-navbar-shell").forEach(bindNavbar);
};
