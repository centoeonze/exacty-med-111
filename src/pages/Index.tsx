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
  <>
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
    <FloatingWhatsAppButton />
  </>
);

export default Index;
