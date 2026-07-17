import { createElement } from "react";
import ExactyLandingPage from "@/components/exacty/ExactyLandingPage";
import { renderSnapshot } from "./snapshotHtml";

/**
 * Default canvas = GrapesJS-editable HTML from the same React tree as the Home.
 * (Live React preview is an optional block — see exactyLiveLanding.ts.)
 */
export const getDefaultPageHtml = () =>
  renderSnapshot(createElement(ExactyLandingPage));
