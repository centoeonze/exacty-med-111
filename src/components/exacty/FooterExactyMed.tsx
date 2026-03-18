import { motion } from "framer-motion";
import logoCentoEOnze from "@/assets/centoeonzelogo copy.png";
import logoExactyBranca from "@/assets/logoexactybranca.svg";

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
      className="relative mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 text-center md:flex-row md:gap-6 md:text-left"
    >
      <img src={logoExactyBranca} alt="Exacty Med" className="h-10 w-auto md:h-12" />
      <p className="text-sm text-white/50 md:text-[15px]">
        © {new Date().getFullYear()} Exacty Med — Distribuição especializada para profissionais da estética avançada.
      </p>
      <div className="inline-flex items-center justify-center gap-3 text-white/58 md:justify-end">
        <span className="text-xs font-medium tracking-[0.08em] text-white/55 md:text-[13px]">Desenvolvido por</span>
        <img
          src={logoCentoEOnze}
          alt="Cento e Onze"
          className="h-5 w-auto object-contain opacity-90 md:h-6"
        />
      </div>
    </motion.div>
  </footer>
);

export default FooterExactyMed;
