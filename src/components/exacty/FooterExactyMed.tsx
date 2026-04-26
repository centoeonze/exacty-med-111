import { motion } from "framer-motion";
import logoCentoEOnze from "@/assets/centoeonzelogo copy.png";
import logoExactyBranca from "@/assets/logoexactybranca.svg";

const COMPANY_ADDRESS = "Av. dos Estudantes, 2711 - Setor 1, Ibiporã - PR, 86200-055";

const FooterExactyMed = () => (
  <footer className="exacty-section-blend relative overflow-hidden bg-transparent px-6 py-5 md:px-8 md:py-6">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,2,11,0.72),rgba(4,1,9,0.86))]" />
      <div className="absolute inset-x-0 -top-14 h-36 bg-[linear-gradient(180deg,rgba(7,4,15,0.46),rgba(15,10,24,0.12)_58%,transparent)] blur-[14px]" />
      <div className="absolute left-1/2 top-0 h-20 w-[34rem] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgba(123,67,255,0.10),rgba(123,67,255,0.03)_48%,transparent_72%)] blur-3xl" />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-[1280px]"
    >
      <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3 md:items-start md:gap-10 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <img src={logoExactyBranca} alt="Exacty Med" loading="lazy" decoding="async" className="h-10 w-auto md:h-12" />
          <p className="mt-3 text-sm text-white/50 md:text-[15px]">
            © {new Date().getFullYear()} Exacty Med — Distribuição especializada para profissionais da estética avançada.
          </p>
        </div>

        <div className="text-sm text-white/55">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">Contato</p>
          <p className="mt-3">
            <span className="text-white/55">E-mail:</span>{" "}
            <a
              href="mailto:comercial@exactymed.com.br"
              className="text-violet-200/80 transition-colors duration-200 hover:text-violet-200"
            >
              comercial@exactymed.com.br
            </a>
          </p>
        </div>

        <div className="text-sm text-white/55 md:text-right">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">Dados legais</p>
          <p className="mt-3">CNPJ: 47.748.479/0001-02</p>
          <p className="mt-1">
            Endereço: {COMPANY_ADDRESS ? COMPANY_ADDRESS : "a definir"}
          </p>
          <div className="mt-4 inline-flex items-center justify-center gap-3 text-white/58 md:justify-end">
            <span className="text-xs font-medium tracking-[0.08em] text-white/55 md:text-[13px]">Desenvolvido por</span>
            <a
              href="https://centoeonze.space/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Abrir site da centoeonze em nova guia"
              className="cursor-pointer transition-opacity duration-200 hover:opacity-100"
            >
              <img
                src={logoCentoEOnze}
                alt="Cento e Onze"
                loading="lazy"
                decoding="async"
                className="h-5 w-auto object-contain opacity-90 md:h-6"
              />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  </footer>
);

export default FooterExactyMed;
