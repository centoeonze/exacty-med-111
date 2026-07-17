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
    try {
      setPublished(loadPublished());
    } catch (error) {
      console.error("[Exacty] Falha ao carregar página publicada; exibindo Home React.", error);
      setPublished(null);
    } finally {
      setReady(true);
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
