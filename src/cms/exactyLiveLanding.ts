/**
 * GrapesJS compatibility layer: mount the real ExactyLandingPage (Framer Motion,
 * Embla, hooks) inside the canvas so Home animations run. No parallel animation code.
 */
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Editor } from "grapesjs";
import ExactyLandingPage from "@/components/exacty/ExactyLandingPage";

export const EXACTY_LIVE_TYPE = "exacty-live-landing";

type LiveView = {
  __exactyRoot?: Root;
};

/** HTML for optional live React preview block (not the editable default page). */
export const getDefaultLiveLandingHtml = () =>
  `<div data-gjs-type="${EXACTY_LIVE_TYPE}" data-exacty-live-landing="1" style="min-height:100%;width:100%"></div>`;

export const registerExactyLivePreviewBlock = (editor: Editor) => {
  editor.BlockManager.add("exacty-live-preview", {
    label: "Preview Home (animações)",
    category: "Exacty Med",
    content: getDefaultLiveLandingHtml(),
    media: `<div style="font-size:10px;padding:6px;text-align:center;color:#c4b5fd">Live React</div>`,
  });
};

export const registerExactyLiveLandingType = (editor: Editor) => {
  editor.DomComponents.addType(EXACTY_LIVE_TYPE, {
    isComponent: (el) =>
      el?.getAttribute?.("data-exacty-live-landing") === "1" ||
      el?.getAttribute?.("data-gjs-type") === EXACTY_LIVE_TYPE,
    model: {
      defaults: {
        tagName: "div",
        name: "Preview Home (animações)",
        droppable: false,
        editable: false,
        stylable: false,
        selectable: true,
        hoverable: true,
        highlightable: true,
        layerable: true,
        attributes: {
          "data-exacty-live-landing": "1",
          "data-gjs-type": EXACTY_LIVE_TYPE,
        },
        style: {
          "min-height": "100%",
          width: "100%",
        },
      },
    },
    view: {
      onRender(this: LiveView & { el: HTMLElement }) {
        this.__exactyRoot?.unmount();
        this.__exactyRoot = undefined;

        const { el } = this;
        el.innerHTML = "";

        const mount = el.ownerDocument.createElement("div");
        mount.setAttribute("data-exacty-live-root", "1");
        mount.style.minHeight = "100%";
        mount.style.width = "100%";
        el.appendChild(mount);

        const root = createRoot(mount);
        this.__exactyRoot = root;
        root.render(createElement(ExactyLandingPage));
      },
      removed(this: LiveView) {
        this.__exactyRoot?.unmount();
        this.__exactyRoot = undefined;
      },
    },
  });
};
