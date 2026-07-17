import { useEffect, useState } from "react";
import FloatingWhatsAppButton from "@/components/exacty/FloatingWhatsAppButton";
import ExactyLandingPage from "@/components/exacty/ExactyLandingPage";
import CmsPageRenderer from "@/cms/CmsPageRenderer";
import { loadPublished, type CmsPublishedPage } from "@/cms/storage";

const publishedHasFloatingWhatsApp = (html: string) =>
  html.includes('data-exacty-floating-whatsapp="1"') || html.includes("animate-whatsapp-float");

const Index = () => {
  const [published, setPublished] = useState<CmsPublishedPage | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "9176a5",
      },
      body: JSON.stringify({
        sessionId: "9176a5",
        runId: "home-pre-fix",
        hypothesisId: "A",
        location: "Index.tsx:useEffect:start",
        message: "Home mounting — about to loadPublished",
        data: { path: window.location.pathname },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    try {
      const page = loadPublished();
      // #region agent log
      fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "9176a5",
        },
        body: JSON.stringify({
          sessionId: "9176a5",
          runId: "home-pre-fix",
          hypothesisId: "A",
          location: "Index.tsx:loadPublished:ok",
          message: "loadPublished succeeded",
          data: { hasHtml: Boolean(page?.html), htmlLen: page?.html?.length ?? 0 },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      setPublished(page);
    } catch (error) {
      // #region agent log
      fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "9176a5",
        },
        body: JSON.stringify({
          sessionId: "9176a5",
          runId: "home-pre-fix",
          hypothesisId: "A",
          location: "Index.tsx:loadPublished:throw",
          message: "loadPublished threw — Home would stay blank without catch",
          data: {
            errorName: error instanceof Error ? error.name : typeof error,
            errorMessage: error instanceof Error ? error.message : String(error),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      console.error("[Exacty] Falha ao carregar página publicada; exibindo Home React.", error);
      setPublished(null);
    } finally {
      setReady(true);
      // #region agent log
      fetch("http://127.0.0.1:7404/ingest/d22fde15-2577-4ad4-9d0d-528e758faed8", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "9176a5",
        },
        body: JSON.stringify({
          sessionId: "9176a5",
          runId: "home-pre-fix",
          hypothesisId: "A",
          location: "Index.tsx:ready",
          message: "Home ready flag set",
          data: { ready: true },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
    }
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-[#05020B]" />;
  }

  if (published?.html) {
    return (
      <div className="min-h-screen bg-[#05020B]">
        <CmsPageRenderer page={published} />
        {/* Fallback for older publishes that predate the in-page floating button. */}
        {!publishedHasFloatingWhatsApp(published.html) ? <FloatingWhatsAppButton /> : null}
      </div>
    );
  }

  // ExactyLandingPage already includes FloatingWhatsAppButton (same SSOT as CMS).
  return <ExactyLandingPage />;
};

export default Index;
