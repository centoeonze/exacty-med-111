import NavbarExactyMed from "@/components/exacty/NavbarExactyMed";
import HeroExactyMed from "@/components/exacty/HeroExactyMed";
import TrustSectionExactyMed from "@/components/exacty/TrustSectionExactyMed";
import RegulatorySectionExactyMed from "@/components/exacty/RegulatorySectionExactyMed";
import ProductPortfolioSection from "@/components/exacty/ProductPortfolioSection";
import AuthoritySectionExactyMed from "@/components/exacty/AuthoritySectionExactyMed";
import TestimonialsSectionExactyMed from "@/components/exacty/TestimonialsSectionExactyMed";
import FAQSectionExactyMed from "@/components/exacty/FAQSectionExactyMed";
import FinalCTASection from "@/components/exacty/FinalCTASection";
import FooterExactyMed from "@/components/exacty/FooterExactyMed";
import FloatingWhatsAppButton from "@/components/exacty/FloatingWhatsAppButton";

/** Single source of truth for the Exacty Med landing tree (eager imports for CMS snapshot). */
const ExactyLandingPage = () => (
  <div className="exacty-page-shell relative overflow-hidden bg-[#05020B]">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#05020B_0%,#07030F_20%,#07050D_44%,#06030D_68%,#040109_100%)]" />
      <div className="absolute left-1/2 top-0 h-[520px] w-[min(1200px,96vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(132,88,236,0.18)_0%,rgba(88,48,166,0.08)_42%,transparent_72%)] blur-[112px]" />
      <div className="absolute left-1/2 top-[24%] h-[420px] w-[min(1100px,94vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(112,67,219,0.12)_0%,rgba(112,67,219,0.04)_48%,transparent_76%)] blur-[120px]" />
      <div className="absolute left-[14%] top-[42%] h-[340px] w-[340px] rounded-full bg-violet-500/[0.08] blur-[120px]" />
      <div className="absolute right-[10%] top-[58%] h-[380px] w-[380px] rounded-full bg-fuchsia-500/[0.06] blur-[132px]" />
      <div className="absolute left-1/2 top-[74%] h-[340px] w-[min(980px,90vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,74,224,0.12)_0%,rgba(116,74,224,0.05)_46%,transparent_78%)] blur-[120px]" />
      <div className="absolute inset-0 opacity-[0.028] [background-image:radial-gradient(rgba(255,255,255,0.3)_0.8px,transparent_0.8px)] [background-size:28px_28px]" />
    </div>

    <div className="relative z-10">
      <NavbarExactyMed />
      <main>
        <HeroExactyMed />
        <TrustSectionExactyMed />
        <RegulatorySectionExactyMed />
        <ProductPortfolioSection />
        <AuthoritySectionExactyMed />
        <TestimonialsSectionExactyMed />
        <FAQSectionExactyMed />
        <FinalCTASection />
      </main>
      <FooterExactyMed />
    </div>

    <FloatingWhatsAppButton />
  </div>
);

export default ExactyLandingPage;
