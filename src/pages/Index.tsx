import NavbarExactyMed from "@/components/exacty/NavbarExactyMed";
import HeroExactyMed from "@/components/exacty/HeroExactyMed";
import TrustSectionExactyMed from "@/components/exacty/TrustSectionExactyMed";
import ProductPortfolioSection from "@/components/exacty/ProductPortfolioSection";
import AuthoritySectionExactyMed from "@/components/exacty/AuthoritySectionExactyMed";
import TestimonialsSectionExactyMed from "@/components/exacty/TestimonialsSectionExactyMed";
import FinalCTASection from "@/components/exacty/FinalCTASection";
import FloatingWhatsAppButton from "@/components/exacty/FloatingWhatsAppButton";
import FooterExactyMed from "@/components/exacty/FooterExactyMed";

const Index = () => (
  <div className="exacty-page-shell relative overflow-hidden bg-[#05020B]">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#05020B_0%,#07030F_20%,#07050D_44%,#06030D_68%,#040109_100%)]" />
      <div className="absolute left-1/2 top-0 h-[520px] w-[min(1200px,96vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(132,88,236,0.18)_0%,rgba(88,48,166,0.08)_42%,transparent_72%)] blur-[140px]" />
      <div className="absolute left-1/2 top-[24%] h-[420px] w-[min(1100px,94vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(112,67,219,0.12)_0%,rgba(112,67,219,0.04)_48%,transparent_76%)] blur-[150px]" />
      <div className="absolute left-[14%] top-[42%] h-[360px] w-[360px] rounded-full bg-violet-500/[0.08] blur-[150px]" />
      <div className="absolute right-[10%] top-[58%] h-[420px] w-[420px] rounded-full bg-fuchsia-500/[0.06] blur-[170px]" />
      <div className="absolute left-1/2 top-[74%] h-[360px] w-[min(980px,90vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(116,74,224,0.12)_0%,rgba(116,74,224,0.05)_46%,transparent_78%)] blur-[150px]" />
      <div className="absolute inset-0 opacity-[0.028] [background-image:radial-gradient(rgba(255,255,255,0.3)_0.8px,transparent_0.8px)] [background-size:28px_28px]" />
    </div>

    <div className="relative z-10">
      <NavbarExactyMed />
      <main>
        <HeroExactyMed />
        <TrustSectionExactyMed />
        <ProductPortfolioSection />
        <AuthoritySectionExactyMed />
        <TestimonialsSectionExactyMed />
        <FinalCTASection />
      </main>
      <FooterExactyMed />
    </div>
    <FloatingWhatsAppButton />
  </div>
);

export default Index;
