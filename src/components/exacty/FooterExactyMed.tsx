import logo from "@/assets/logo-exacty-med.png";

const FooterExactyMed = () => (
  <footer className="border-t border-border/50 py-8 px-5 md:px-8">
    <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
      <img src={logo} alt="Exacty Med" className="h-7 w-auto opacity-70" />
      <p className="text-xs text-muted-foreground text-center">
        © {new Date().getFullYear()} Exacty Med — Distribuição especializada para profissionais da estética avançada.
      </p>
    </div>
  </footer>
);

export default FooterExactyMed;
